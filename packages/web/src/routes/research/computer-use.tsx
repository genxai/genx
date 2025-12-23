import { createFileRoute, Link } from "@tanstack/react-router"
import { AppLayout } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/research/computer-use")({
  component: ComputerUsePage,
})

function ComputerUsePage() {
  return (
    <AppLayout>
      <div className="min-h-screen text-white">
        {/* Hero */}
        <div className="border-b border-white/10 px-6 py-12 bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-purple-400 text-sm font-mono">research</span>
              <span className="text-white/30">/</span>
              <span className="text-sm text-white/60">computer-use</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Train Your Own{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Computer Use
              </span>{" "}
              Model
            </h1>
            <p className="text-xl text-white/60 max-w-3xl">
              Build an AI agent that can see your screen and control your computer.
              From data collection to training to real-time inference.
            </p>
            <div className="flex gap-4 mt-8">
              <Link
                to="/infra/train"
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90"
              >
                Train on GenX GPUs
              </Link>
              <a
                href="#architecture"
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20"
              >
                Learn the Architecture
              </a>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
          {/* What is Computer Use */}
          <section>
            <h2 className="text-2xl font-bold mb-6">What is Computer Use?</h2>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-white/70 mb-6">
                Computer Use models are Vision-Language-Action (VLA) models that can:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <CapabilityCard
                  icon="👁️"
                  title="See the Screen"
                  description="Process screenshots to understand UI state, text, buttons, and layout"
                />
                <CapabilityCard
                  icon="🧠"
                  title="Understand Intent"
                  description="Parse natural language instructions and plan multi-step actions"
                />
                <CapabilityCard
                  icon="🖱️"
                  title="Control the Computer"
                  description="Execute mouse clicks, keyboard input, and navigate applications"
                />
              </div>
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture">
            <h2 className="text-2xl font-bold mb-6">Model Architecture</h2>
            <p className="text-white/60 mb-6">
              Computer Use models combine a Vision Encoder (ViT/SigLIP), a Language Model backbone,
              and an Action Head that outputs discrete actions (click, type, scroll, etc.)
            </p>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-semibold mb-4">Architecture Diagram</h3>
              <div className="font-mono text-sm text-white/70 bg-black/30 rounded-lg p-4 overflow-x-auto">
                <pre>{`┌─────────────────────────────────────────────────────────────────────────┐
│                              INPUT                                       │
├─────────────────────────────────┬───────────────────────────────────────┤
│      Screenshot (1920×1080)     │     Instruction: "Open Chrome and     │
│                                 │      search for weather"              │
└─────────────────┬───────────────┴───────────────────┬───────────────────┘
                  │                                   │
        ┌─────────▼─────────┐               ┌────────▼────────┐
        │   Vision Encoder  │               │  Text Tokenizer │
        │   (SigLIP / ViT)  │               │                 │
        │   384×384 patches │               │                 │
        └─────────┬─────────┘               └────────┬────────┘
                  │                                   │
                  │ [N, 768] image tokens            │ [M, 4096] text tokens
                  │                                   │
                  └───────────────┬───────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Projection + Concat     │
                    │   [N+M, hidden_dim]       │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Language Model Backbone │
                    │   (Llama 3.2 / Qwen2-VL)  │
                    │   32 layers, 4096 dim     │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   Action Type     │  │    Coordinates    │  │   Text Content    │
│   Head (softmax)  │  │   Head (x, y)     │  │   Head (tokens)   │
│                   │  │                   │  │                   │
│  click | type |   │  │  [0.0-1.0, 0.0-   │  │  "weather NYC"    │
│  scroll | key |   │  │   1.0] normalized │  │                   │
│  wait | done      │  │                   │  │                   │
└───────────────────┘  └───────────────────┘  └───────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Combined Action Output  │
                    │                           │
                    │  { action: "click",       │
                    │    x: 0.45, y: 0.12,      │
                    │    text: null }           │
                    └───────────────────────────┘`}</pre>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">Action Space</h3>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-white/70">
                  <pre>{`class ActionType(Enum):
  # Mouse actions
  CLICK = "click"           # Left click at (x, y)
  RIGHT_CLICK = "right_click"
  DOUBLE_CLICK = "double_click"
  DRAG = "drag"             # From (x1,y1) to (x2,y2)

  # Keyboard actions
  TYPE = "type"             # Type text string
  KEY = "key"               # Press key (enter, tab, etc)
  HOTKEY = "hotkey"         # Combo (cmd+c, ctrl+shift+t)

  # Scroll actions
  SCROLL_UP = "scroll_up"
  SCROLL_DOWN = "scroll_down"

  # Control flow
  WAIT = "wait"             # Wait for page load
  SCREENSHOT = "screenshot" # Take new screenshot
  DONE = "done"             # Task complete

@dataclass
class Action:
  type: ActionType
  x: float | None = None     # 0.0 - 1.0
  y: float | None = None     # 0.0 - 1.0
  text: str | None = None
  key: str | None = None`}</pre>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Model Variants</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/50 border-b border-white/10">
                      <th className="text-left py-2">Model</th>
                      <th className="text-left py-2">Params</th>
                      <th className="text-left py-2">VRAM</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/70">
                    <tr className="border-b border-white/5">
                      <td className="py-2">Qwen2-VL-2B</td>
                      <td>2B</td>
                      <td>~8GB</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2">Qwen2-VL-7B</td>
                      <td>7B</td>
                      <td>~18GB</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2">Llama 3.2 11B Vision</td>
                      <td>11B</td>
                      <td>~26GB</td>
                    </tr>
                    <tr>
                      <td className="py-2">Llama 3.2 90B Vision</td>
                      <td>90B</td>
                      <td>~180GB</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-white/40 mt-4">
                  Start with 2B-7B for experiments. Scale up for production.
                </p>
              </div>
            </div>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Step 1: Data Collection</h2>
            <p className="text-white/60 mb-6">
              You need paired data: screenshots + actions. Either collect from human demonstrations
              or use synthetic data from existing agents.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <DataSourceCard
                title="Human Demonstrations"
                icon="👤"
                items={[
                  "Screen record while performing tasks",
                  "Log all mouse/keyboard events with timestamps",
                  "Sync screenshots with action events",
                  "Label with natural language instructions",
                ]}
                code={`# Python screen + action recorder
import pyautogui
import mss
import json
from datetime import datetime

class DemoRecorder:
  def __init__(self):
    self.sct = mss.mss()
    self.events = []
    self.screenshots = []

  def capture_frame(self):
    img = self.sct.grab(self.sct.monitors[1])
    timestamp = datetime.now().isoformat()
    self.screenshots.append({
      'timestamp': timestamp,
      'image': img
    })

  def log_action(self, action_type, **kwargs):
    self.events.append({
      'timestamp': datetime.now().isoformat(),
      'action': action_type,
      **kwargs
    })

  def save_episode(self, instruction: str):
    # Save as training episode
    episode = {
      'instruction': instruction,
      'screenshots': self.screenshots,
      'actions': self.events
    }
    with open(f'episode_{len(self.episodes)}.json', 'w') as f:
      json.dump(episode, f)`}
              />

              <DataSourceCard
                title="Synthetic Data (Agent Rollouts)"
                icon="🤖"
                items={[
                  "Use existing VLM to generate action traces",
                  "Filter successful task completions",
                  "Augment with instruction variations",
                  "Bootstrap from web automation datasets",
                ]}
                code={`# Generate synthetic demos with existing model
from openai import OpenAI
import base64

def generate_synthetic_demo(task: str, env):
  client = OpenAI()
  trajectory = []

  while not env.is_done():
    screenshot = env.screenshot()
    img_b64 = base64.b64encode(screenshot).decode()

    response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{
        "role": "user",
        "content": [
          {"type": "text", "text": f"Task: {task}\\nWhat action next?"},
          {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
        ]
      }]
    )

    action = parse_action(response.choices[0].message.content)
    trajectory.append({
      'screenshot': screenshot,
      'action': action
    })
    env.execute(action)

  return trajectory`}
              />
            </div>

            <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/30 mt-6">
              <h3 className="text-lg font-semibold mb-3 text-purple-400">Public Datasets</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <DatasetCard
                  name="OmniACT"
                  size="9.8K episodes"
                  description="UI screenshots + task instructions"
                />
                <DatasetCard
                  name="ScreenAgent"
                  size="3.5K episodes"
                  description="Daily computer tasks with VLM annotations"
                />
                <DatasetCard
                  name="Mind2Web"
                  size="2K tasks"
                  description="Web navigation trajectories"
                />
              </div>
            </div>
          </section>

          {/* Training */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Step 2: Training Pipeline</h2>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-semibold mb-4">Training Strategy: SFT → RL</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">Phase 1: Supervised Fine-Tuning</h4>
                  <ul className="text-sm text-white/60 space-y-2">
                    <li>• Train on human demonstrations</li>
                    <li>• Cross-entropy loss on action predictions</li>
                    <li>• LoRA for efficient fine-tuning</li>
                    <li>• ~10K episodes, 1-2 epochs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Phase 2: Reinforcement Learning</h4>
                  <ul className="text-sm text-white/60 space-y-2">
                    <li>• GRPO / PPO on live environment</li>
                    <li>• Reward: task completion + efficiency</li>
                    <li>• Verifier model for reward signals</li>
                    <li>• Online rollouts with exploration</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-semibold mb-4">SFT Training Code</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-white/70 overflow-x-auto">
                <pre>{`# train_computer_use.py
import torch
from transformers import (
  Qwen2VLForConditionalGeneration,
  AutoProcessor,
)
from peft import LoraConfig, get_peft_model
from datasets import load_dataset
from trl import SFTTrainer, SFTConfig

# Load base model
model = Qwen2VLForConditionalGeneration.from_pretrained(
  "Qwen/Qwen2-VL-7B-Instruct",
  torch_dtype=torch.bfloat16,
  device_map="auto",
)
processor = AutoProcessor.from_pretrained("Qwen/Qwen2-VL-7B-Instruct")

# LoRA config
lora_config = LoraConfig(
  r=64,
  lora_alpha=128,
  target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
  lora_dropout=0.05,
  task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora_config)

# Dataset
def format_example(example):
  """Format screenshot + instruction + action into training example."""
  messages = [
    {
      "role": "user",
      "content": [
        {"type": "image", "image": example["screenshot"]},
        {"type": "text", "text": f"Task: {example['instruction']}\\nWhat action should I take?"}
      ]
    },
    {
      "role": "assistant",
      "content": format_action(example["action"])
    }
  ]
  return {"messages": messages}

dataset = load_dataset("your-org/computer-use-demos")
dataset = dataset.map(format_example)

# Training config
training_args = SFTConfig(
  output_dir="./computer-use-sft",
  per_device_train_batch_size=2,
  gradient_accumulation_steps=8,
  learning_rate=2e-5,
  num_train_epochs=2,
  bf16=True,
  logging_steps=10,
  save_steps=500,
  gradient_checkpointing=True,
)

# Train
trainer = SFTTrainer(
  model=model,
  args=training_args,
  train_dataset=dataset["train"],
  processing_class=processor,
)
trainer.train()
model.save_pretrained("./computer-use-model")`}</pre>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">RL Fine-Tuning with GRPO</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-white/70 overflow-x-auto">
                <pre>{`# rl_finetune.py
from trl import GRPOTrainer, GRPOConfig
from computer_use_env import ComputerUseEnv

# Environment for rollouts
env = ComputerUseEnv(
  display=":1",           # Virtual display
  resolution=(1920, 1080),
  timeout=300,            # 5 min per episode
)

# Reward function
def compute_reward(trajectory, task):
  """
  Reward based on:
  1. Task completion (verified by VLM)
  2. Efficiency (fewer steps = better)
  3. No errors/crashes
  """
  completion = verify_task_completion(trajectory[-1].screenshot, task)
  efficiency = max(0, 1 - len(trajectory) / 50)  # Penalize long trajectories
  errors = sum(1 for t in trajectory if t.action.type == "error")

  reward = completion * 10 + efficiency * 2 - errors * 5
  return reward

# GRPO config
grpo_config = GRPOConfig(
  output_dir="./computer-use-grpo",
  per_device_train_batch_size=1,
  gradient_accumulation_steps=16,
  num_generations=4,        # Rollouts per prompt
  max_new_tokens=256,
  learning_rate=1e-6,
  num_train_epochs=1,
  kl_coef=0.1,
  bf16=True,
)

# Task prompts
tasks = [
  "Open Chrome and search for 'best restaurants nearby'",
  "Create a new folder on desktop called 'Projects'",
  "Open VS Code and create a new Python file",
  "Check email in Gmail and archive read messages",
  # ... more tasks
]

def generate_rollout(model, task):
  """Generate trajectory by running model in environment."""
  env.reset()
  trajectory = []

  for step in range(50):  # Max 50 steps
    screenshot = env.screenshot()
    action = model.predict(screenshot, task)
    trajectory.append(Step(screenshot=screenshot, action=action))

    if action.type == "done":
      break

    env.execute(action)

  reward = compute_reward(trajectory, task)
  return trajectory, reward

# Train with GRPO
trainer = GRPOTrainer(
  model=model,
  config=grpo_config,
  reward_fn=compute_reward,
  generate_fn=generate_rollout,
)
trainer.train(tasks)`}</pre>
              </div>
            </div>
          </section>

          {/* Inference */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Step 3: Real-Time Inference</h2>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-semibold mb-4">Inference Server</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-white/70 overflow-x-auto">
                <pre>{`# inference_server.py
from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
from PIL import Image
import base64
import io

app = FastAPI()

# Load model
model = Qwen2VLForConditionalGeneration.from_pretrained(
  "./computer-use-model",
  torch_dtype=torch.bfloat16,
  device_map="auto",
)
processor = AutoProcessor.from_pretrained("./computer-use-model")

class PredictRequest(BaseModel):
  screenshot_b64: str
  instruction: str
  history: list[dict] = []

class ActionResponse(BaseModel):
  action_type: str
  x: float | None = None
  y: float | None = None
  text: str | None = None
  confidence: float

@app.post("/predict", response_model=ActionResponse)
async def predict_action(req: PredictRequest):
  # Decode screenshot
  img_bytes = base64.b64decode(req.screenshot_b64)
  image = Image.open(io.BytesIO(img_bytes))

  # Build messages
  messages = [{
    "role": "user",
    "content": [
      {"type": "image", "image": image},
      {"type": "text", "text": f"Task: {req.instruction}\\n\\nHistory: {req.history}\\n\\nWhat action should I take next?"}
    ]
  }]

  # Process
  inputs = processor(
    text=processor.apply_chat_template(messages, add_generation_prompt=True),
    images=[image],
    return_tensors="pt"
  ).to(model.device)

  # Generate
  with torch.no_grad():
    outputs = model.generate(
      **inputs,
      max_new_tokens=100,
      do_sample=False,
    )

  response = processor.decode(outputs[0], skip_special_tokens=True)
  action = parse_action_response(response)

  return ActionResponse(**action)

# Run with: uvicorn inference_server:app --host 0.0.0.0 --port 8000`}</pre>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Agent Loop (Client)</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-white/70 overflow-x-auto">
                <pre>{`# agent.py
import requests
import pyautogui
import mss
import base64
import time

class ComputerUseAgent:
  def __init__(self, server_url: str = "http://localhost:8000"):
    self.server_url = server_url
    self.sct = mss.mss()
    self.history = []

  def screenshot(self) -> str:
    """Capture screen and return base64."""
    img = self.sct.grab(self.sct.monitors[1])
    # Convert to PNG bytes
    from PIL import Image
    import io
    pil_img = Image.frombytes("RGB", img.size, img.bgra, "raw", "BGRX")
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode()

  def execute_action(self, action: dict):
    """Execute action on the computer."""
    action_type = action["action_type"]

    if action_type == "click":
      x = int(action["x"] * pyautogui.size()[0])
      y = int(action["y"] * pyautogui.size()[1])
      pyautogui.click(x, y)
      self.history.append(f"Clicked at ({x}, {y})")

    elif action_type == "type":
      pyautogui.typewrite(action["text"], interval=0.02)
      self.history.append(f"Typed: {action['text']}")

    elif action_type == "key":
      pyautogui.press(action["text"])
      self.history.append(f"Pressed: {action['text']}")

    elif action_type == "scroll_down":
      pyautogui.scroll(-3)
      self.history.append("Scrolled down")

    elif action_type == "scroll_up":
      pyautogui.scroll(3)
      self.history.append("Scrolled up")

    elif action_type == "wait":
      time.sleep(2)
      self.history.append("Waited 2s")

  def run(self, instruction: str, max_steps: int = 30):
    """Execute task with instruction."""
    print(f"Task: {instruction}")
    self.history = []

    for step in range(max_steps):
      # Capture current state
      screenshot = self.screenshot()

      # Get action from model
      response = requests.post(
        f"{self.server_url}/predict",
        json={
          "screenshot_b64": screenshot,
          "instruction": instruction,
          "history": self.history[-10:]  # Last 10 actions
        }
      )
      action = response.json()

      print(f"Step {step + 1}: {action['action_type']} (conf: {action['confidence']:.2f})")

      if action["action_type"] == "done":
        print("Task completed!")
        return True

      # Execute
      self.execute_action(action)
      time.sleep(0.5)  # Small delay between actions

    print("Max steps reached")
    return False

# Usage
agent = ComputerUseAgent()
agent.run("Open Chrome and search for 'weather in San Francisco'")`}</pre>
              </div>
            </div>
          </section>

          {/* Train on GenX */}
          <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4">Train on GenX Infrastructure</h2>
            <p className="text-white/60 mb-6">
              Use Prime Intellect GPUs through GenX to train your computer use model.
              A100 40GB can train the 7B model with LoRA in ~4 hours on 10K episodes.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="font-semibold text-purple-400 mb-2">Recommended Setup</h3>
                <ul className="text-sm text-white/60 space-y-1">
                  <li>• GPU: A100 40GB × 1</li>
                  <li>• Model: Qwen2-VL-7B</li>
                  <li>• Method: LoRA (r=64)</li>
                  <li>• Time: ~4 hours</li>
                </ul>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="font-semibold text-cyan-400 mb-2">Cost Estimate</h3>
                <ul className="text-sm text-white/60 space-y-1">
                  <li>• A100 40GB: ~$1.89/hr</li>
                  <li>• 4 hours SFT: ~$7.56</li>
                  <li>• 8 hours RL: ~$15.12</li>
                  <li>• Total: ~$23</li>
                </ul>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-400 mb-2">Data Needed</h3>
                <ul className="text-sm text-white/60 space-y-1">
                  <li>• SFT: 5-10K episodes</li>
                  <li>• RL: 1K+ task prompts</li>
                  <li>• Each episode: ~50 steps</li>
                  <li>• Storage: ~50GB</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                to="/infra/deploy"
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90"
              >
                Provision GPU
              </Link>
              <Link
                to="/infra/train"
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20"
              >
                Start Training Job
              </Link>
              <Link
                to="/infra/playground"
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20"
              >
                Test Inference
              </Link>
            </div>
          </section>

          {/* Resources */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Resources & References</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ResourceCard
                name="Anthropic Computer Use"
                url="https://docs.anthropic.com/en/docs/agents-and-tools/computer-use"
                description="Official docs on Claude's computer use capability"
              />
              <ResourceCard
                name="ShowUI Paper"
                url="https://arxiv.org/abs/2411.17465"
                description="Vision-Language-Action model for GUI agents"
              />
              <ResourceCard
                name="Qwen2-VL"
                url="https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct"
                description="Strong base VLM for computer use fine-tuning"
              />
              <ResourceCard
                name="OmniACT Dataset"
                url="https://huggingface.co/datasets/Writer/omniact"
                description="Benchmark dataset for UI understanding"
              />
              <ResourceCard
                name="TRL Library"
                url="https://huggingface.co/docs/trl"
                description="Transformers RL - SFT, GRPO, PPO trainers"
              />
              <ResourceCard
                name="OS-Atlas"
                url="https://arxiv.org/abs/2410.23218"
                description="Foundation action model for GUI agents"
              />
            </div>
          </section>

          {/* Next Steps */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Extensions & Next Steps</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <ExtensionCard
                title="Multi-Monitor Support"
                description="Extend to handle multiple displays and cross-screen navigation"
                difficulty="Medium"
              />
              <ExtensionCard
                title="Agentic Planning"
                description="Add explicit planning step before action execution"
                difficulty="Medium"
              />
              <ExtensionCard
                title="Tool Use Integration"
                description="Combine with API calls, file system, and code execution"
                difficulty="Hard"
              />
              <ExtensionCard
                title="Self-Correction"
                description="Detect and recover from errors mid-task"
                difficulty="Hard"
              />
              <ExtensionCard
                title="Multimodal Memory"
                description="Remember past screens and actions across sessions"
                difficulty="Hard"
              />
              <ExtensionCard
                title="Voice Control"
                description="Add speech-to-text for voice-commanded computer use"
                difficulty="Easy"
              />
            </div>
          </section>
        </main>
      </div>
    </AppLayout>
  )
}

// Components

function CapabilityCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  )
}

function DataSourceCard({
  title,
  icon,
  items,
  code,
}: {
  title: string
  icon: string
  items: string[]
  code: string
}) {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="text-sm text-white/60 space-y-1 mb-4">
        {items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
      <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-white/60 overflow-x-auto">
        <pre>{code}</pre>
      </div>
    </div>
  )
}

function DatasetCard({ name, size, description }: { name: string; size: string; description: string }) {
  return (
    <div className="bg-black/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">{name}</span>
        <span className="text-xs text-purple-400">{size}</span>
      </div>
      <p className="text-xs text-white/50">{description}</p>
    </div>
  )
}

function ResourceCard({ name, url, description }: { name: string; url: string; description: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/30 transition-colors block"
    >
      <h3 className="font-semibold text-cyan-400 mb-2">{name}</h3>
      <p className="text-sm text-white/60">{description}</p>
      <div className="text-xs text-white/30 mt-2 truncate">{url}</div>
    </a>
  )
}

function ExtensionCard({
  title,
  description,
  difficulty,
}: {
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
}) {
  const colors = {
    Easy: "text-green-400 bg-green-500/20",
    Medium: "text-yellow-400 bg-yellow-500/20",
    Hard: "text-red-400 bg-red-500/20",
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${colors[difficulty]}`}>
          {difficulty}
        </span>
      </div>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  )
}
