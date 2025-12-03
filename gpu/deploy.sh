#!/bin/bash
# GenX One-Line Deploy Script
# Usage: curl -sSL https://raw.githubusercontent.com/YOUR_REPO/genx/main/gpu/deploy.sh | bash
# Or: ssh user@gpu-server 'bash -s' < deploy.sh

set -e

MODEL=${MODEL:-"Qwen/Qwen2.5-3B-Instruct"}
PORT=${PORT:-8000}

echo "============================================"
echo "GenX Quick Deploy"
echo "Model: $MODEL"
echo "Port: $PORT"
echo "============================================"

# Update system
sudo apt-get update -qq

# Install Python 3.11 if needed
if ! command -v python3.11 &> /dev/null; then
    sudo apt-get install -y python3.11 python3.11-venv
fi

# Setup directory
mkdir -p ~/genx && cd ~/genx

# Create venv if needed
if [ ! -d "venv" ]; then
    python3.11 -m venv venv
fi
source venv/bin/activate

# Install dependencies
pip install -q --upgrade pip
pip install -q torch --index-url https://download.pytorch.org/whl/cu121
pip install -q vllm httpx

# Check GPU
python3 -c "import torch; print(f'GPU: {torch.cuda.get_device_name(0)} ({torch.cuda.get_device_properties(0).total_memory/1e9:.0f}GB)')"

# Start server
echo "Starting vLLM server on port $PORT..."
echo "First run will download the model (~6GB for small)..."
echo ""
echo "API will be available at: http://$(hostname -I | awk '{print $1}'):$PORT"
echo "Test: curl http://localhost:$PORT/v1/models"
echo ""

exec python -m vllm.entrypoints.openai.api_server \
    --model "$MODEL" \
    --host "0.0.0.0" \
    --port "$PORT" \
    --trust-remote-code \
    --max-model-len 8192 \
    --gpu-memory-utilization 0.9
