#!/bin/bash
set -e

# GenX GPU Server Setup Script
# Target: Ubuntu 22.04+ with NVIDIA A100 40GB

echo "========================================"
echo "GenX GPU Server Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[GenX]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    warn "Not running as root. Some commands may require sudo."
fi

# 1. System updates
log "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install essential tools
log "Installing essential tools..."
sudo apt-get install -y \
    git \
    curl \
    wget \
    htop \
    nvtop \
    tmux \
    build-essential \
    python3.11 \
    python3.11-venv \
    python3-pip

# 3. Check NVIDIA driver
log "Checking NVIDIA driver..."
if ! command -v nvidia-smi &> /dev/null; then
    warn "NVIDIA driver not found. Installing..."
    sudo apt-get install -y nvidia-driver-535
    warn "NVIDIA driver installed. You may need to reboot and re-run this script."
else
    nvidia-smi
    log "NVIDIA driver OK"
fi

# 4. Create GenX directory
GENX_DIR="$HOME/genx"
log "Creating GenX directory at $GENX_DIR..."
mkdir -p $GENX_DIR
cd $GENX_DIR

# 5. Create Python virtual environment
log "Creating Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# 6. Install PyTorch with CUDA
log "Installing PyTorch with CUDA support..."
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 7. Install vLLM for inference
log "Installing vLLM..."
pip install vllm

# 8. Install additional dependencies
log "Installing additional dependencies..."
pip install \
    transformers \
    accelerate \
    huggingface_hub \
    fastapi \
    uvicorn \
    httpx \
    python-dotenv

# 9. Verify GPU access
log "Verifying GPU access from Python..."
python3 -c "
import torch
print(f'PyTorch version: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU: {torch.cuda.get_device_name(0)}')
    print(f'Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB')
"

# 10. Create model download script
log "Creating model download script..."
cat > $GENX_DIR/download_model.py << 'EOF'
#!/usr/bin/env python3
"""Download model from HuggingFace"""
import argparse
from huggingface_hub import snapshot_download

RECOMMENDED_MODELS = {
    "small": "Qwen/Qwen2.5-3B-Instruct",      # ~6GB, fast
    "medium": "Qwen/Qwen2.5-7B-Instruct",     # ~14GB, balanced
    "large": "Qwen/Qwen2.5-14B-Instruct",     # ~28GB, quality
    "llama-small": "meta-llama/Llama-3.2-3B-Instruct",  # ~6GB
}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="small",
                        help=f"Model size or HF model ID. Sizes: {list(RECOMMENDED_MODELS.keys())}")
    parser.add_argument("--output", default="./models", help="Output directory")
    args = parser.parse_args()

    model_id = RECOMMENDED_MODELS.get(args.model, args.model)
    print(f"Downloading {model_id}...")

    path = snapshot_download(
        repo_id=model_id,
        local_dir=f"{args.output}/{model_id.split('/')[-1]}",
        local_dir_use_symlinks=False,
    )
    print(f"Downloaded to: {path}")
    return path

if __name__ == "__main__":
    main()
EOF
chmod +x $GENX_DIR/download_model.py

# 11. Create the serve script
log "Creating model serve script..."
cat > $GENX_DIR/serve.sh << 'EOF'
#!/bin/bash
# GenX Model Server using vLLM

MODEL=${1:-"Qwen/Qwen2.5-3B-Instruct"}
PORT=${2:-8000}
HOST=${3:-"0.0.0.0"}

echo "Starting vLLM server..."
echo "Model: $MODEL"
echo "Endpoint: http://$HOST:$PORT"

cd ~/genx
source venv/bin/activate

python -m vllm.entrypoints.openai.api_server \
    --model "$MODEL" \
    --host "$HOST" \
    --port "$PORT" \
    --trust-remote-code \
    --max-model-len 8192 \
    --gpu-memory-utilization 0.9
EOF
chmod +x $GENX_DIR/serve.sh

# 12. Create systemd service file
log "Creating systemd service..."
cat > $GENX_DIR/genx-inference.service << EOF
[Unit]
Description=GenX Inference Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$GENX_DIR
Environment="PATH=$GENX_DIR/venv/bin:/usr/local/bin:/usr/bin"
ExecStart=$GENX_DIR/venv/bin/python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2.5-3B-Instruct --host 0.0.0.0 --port 8000 --trust-remote-code --max-model-len 8192 --gpu-memory-utilization 0.9
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

log "To install as system service, run:"
echo "  sudo cp $GENX_DIR/genx-inference.service /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable genx-inference"
echo "  sudo systemctl start genx-inference"

# 13. Create quick test script
log "Creating test script..."
cat > $GENX_DIR/test_inference.py << 'EOF'
#!/usr/bin/env python3
"""Test the inference endpoint"""
import httpx
import sys

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

def test():
    print(f"Testing {BASE_URL}...")

    # Test /v1/models
    r = httpx.get(f"{BASE_URL}/v1/models")
    print(f"Models: {r.json()}")

    # Test completion
    r = httpx.post(
        f"{BASE_URL}/v1/chat/completions",
        json={
            "model": r.json()["data"][0]["id"],
            "messages": [
                {"role": "user", "content": "What is 25 + 37? Be brief."}
            ],
            "max_tokens": 100,
            "temperature": 0.7,
        },
        timeout=60.0,
    )
    print(f"Response: {r.json()['choices'][0]['message']['content']}")
    print("Success!")

if __name__ == "__main__":
    test()
EOF
chmod +x $GENX_DIR/test_inference.py

# Done!
echo ""
echo "========================================"
log "Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Download a model:"
echo "     cd ~/genx && source venv/bin/activate"
echo "     python download_model.py --model small"
echo ""
echo "  2. Start the server:"
echo "     ./serve.sh Qwen/Qwen2.5-3B-Instruct"
echo ""
echo "  3. Or run in background with tmux:"
echo "     tmux new -d -s genx './serve.sh Qwen/Qwen2.5-3B-Instruct'"
echo ""
echo "  4. Test it:"
echo "     python test_inference.py"
echo ""
echo "  5. API endpoint will be at:"
echo "     http://YOUR_SERVER_IP:8000/v1/chat/completions"
echo ""
