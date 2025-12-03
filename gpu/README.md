# GenX GPU Deployment

Deploy a language model on your A100 GPU for inference.

## Quick Start (One Command)

SSH into your GPU server and run:

```bash
# Download and run the deploy script
curl -sSL https://raw.githubusercontent.com/YOUR_REPO/genx/main/gpu/deploy.sh | bash
```

Or copy the script manually:

```bash
# On your local machine
scp gpu/deploy.sh user@your-gpu-server:~/

# On the GPU server
chmod +x deploy.sh
./deploy.sh
```

## What Gets Deployed

- **Model**: Qwen2.5-3B-Instruct (6GB, fits easily on A100 40GB)
- **Server**: vLLM with OpenAI-compatible API
- **Endpoint**: `http://YOUR_SERVER_IP:8000/v1/chat/completions`

## Model Options

Set the `MODEL` environment variable to use a different model:

```bash
# Small (3B) - Fast, ~6GB VRAM
MODEL="Qwen/Qwen2.5-3B-Instruct" ./deploy.sh

# Medium (7B) - Balanced, ~14GB VRAM
MODEL="Qwen/Qwen2.5-7B-Instruct" ./deploy.sh

# Large (14B) - Quality, ~28GB VRAM
MODEL="Qwen/Qwen2.5-14B-Instruct" ./deploy.sh

# Llama 3.2 (3B)
MODEL="meta-llama/Llama-3.2-3B-Instruct" ./deploy.sh
```

## Test the Endpoint

```bash
# Check available models
curl http://localhost:8000/v1/models

# Run inference
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-3B-Instruct",
    "messages": [{"role": "user", "content": "What is 25 + 37?"}],
    "max_tokens": 100
  }'
```

## Connect GenX

1. Set the GPU server URL in your `.env`:

```bash
# packages/web/.env
GPU_SERVER_URL=http://YOUR_GPU_SERVER_IP:8000
```

2. The Playground page at `/playground` will connect automatically.

## Run as Background Service

```bash
# Using tmux
tmux new -d -s genx './deploy.sh'

# Check logs
tmux attach -t genx

# Or use systemd (see setup.sh for service file)
```

## Full Setup (If Quick Deploy Fails)

Run the full setup script for more control:

```bash
chmod +x setup.sh
./setup.sh
```

This installs all dependencies and creates helper scripts.

## Troubleshooting

**"CUDA out of memory"**
- Try a smaller model
- Reduce `--gpu-memory-utilization` (default 0.9)
- Reduce `--max-model-len` (default 8192)

**"Model not found"**
- First run downloads the model (~6GB)
- Check HuggingFace login if using gated models: `huggingface-cli login`

**"Connection refused"**
- Ensure port 8000 is open in firewall
- Check if vLLM is running: `ps aux | grep vllm`

## Performance on A100 40GB

| Model | VRAM | Tokens/sec |
|-------|------|------------|
| Qwen2.5-3B | ~6GB | ~150 |
| Qwen2.5-7B | ~14GB | ~80 |
| Qwen2.5-14B | ~28GB | ~40 |

## Security Notes

- The default setup binds to `0.0.0.0` (all interfaces)
- For production, add authentication or use a reverse proxy
- Consider using SSH tunneling for secure access:
  ```bash
  ssh -L 8000:localhost:8000 user@gpu-server
  ```
