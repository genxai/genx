#!/usr/bin/env npx tsx
/**
 * Prime Intellect GPU Provisioning Script
 *
 * Usage:
 *   PRIME_API_KEY=your_key npx tsx scripts/provision.ts
 *
 * Commands:
 *   npx tsx scripts/provision.ts list          # List available GPUs
 *   npx tsx scripts/provision.ts pods          # List your pods
 *   npx tsx scripts/provision.ts create        # Create a pod (A100 40GB with vLLM)
 *   npx tsx scripts/provision.ts delete <id>   # Delete a pod
 */

const API_BASE = "https://api.primeintellect.ai/api/v1"

// Compute API key (different from inference key!)
// Get it from: https://app.primeintellect.ai/dashboard/account
// Needs "Instances -> Read and write" permission
const API_KEY = process.env.PRIME_COMPUTE_KEY || process.env.PRIME_API_KEY

if (!API_KEY) {
  console.error("Error: PRIME_COMPUTE_KEY environment variable is required")
  console.error("")
  console.error("Note: The Compute API key is DIFFERENT from the Inference API key (pit_...)")
  console.error("Get your Compute API key from: https://app.primeintellect.ai/dashboard/account")
  console.error("Make sure it has 'Instances -> Read and write' permission")
  console.error("")
  console.error("Usage: PRIME_COMPUTE_KEY=your_key npx tsx scripts/provision.ts")
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
}

// List available GPUs
async function listAvailability(gpuType?: string) {
  const params = new URLSearchParams({
    gpu_count: "1",
  })
  if (gpuType) {
    params.set("gpu_type", gpuType)
  }

  console.log("\n📊 Fetching GPU availability...\n")

  const response = await fetch(`${API_BASE}/availability/gpus?${params}`, { headers })

  if (!response.ok) {
    console.error("Failed to fetch availability:", response.status, await response.text())
    return
  }

  const data = await response.json()

  if (!data.length) {
    console.log("No GPUs available matching criteria")
    return
  }

  console.log("Available GPUs:\n")
  console.log("┌─────────────────────┬──────────────┬──────────────┬───────────┬────────────┐")
  console.log("│ GPU Type            │ Provider     │ Data Center  │ Price/hr  │ Status     │")
  console.log("├─────────────────────┼──────────────┼──────────────┼───────────┼────────────┤")

  for (const offer of data.slice(0, 20)) {
    const gpu = (offer.gpuType || "").padEnd(19)
    const provider = (offer.provider || "").padEnd(12)
    const dc = (offer.dataCenter || "").slice(0, 12).padEnd(12)
    const price = `$${offer.prices?.onDemand?.toFixed(2) || "N/A"}`.padEnd(9)
    const status = (offer.stockStatus || "").padEnd(10)
    console.log(`│ ${gpu} │ ${provider} │ ${dc} │ ${price} │ ${status} │`)
  }

  console.log("└─────────────────────┴──────────────┴──────────────┴───────────┴────────────┘")
  console.log(`\nShowing ${Math.min(20, data.length)} of ${data.length} offers`)

  return data
}

// List user's pods
async function listPods() {
  console.log("\n🖥️  Fetching your pods...\n")

  const response = await fetch(`${API_BASE}/pods/`, { headers })

  if (!response.ok) {
    console.error("Failed to fetch pods:", response.status, await response.text())
    return
  }

  const data = await response.json()

  if (!data.pods?.length) {
    console.log("No pods found. Create one with: npx tsx scripts/provision.ts create")
    return
  }

  console.log("Your Pods:\n")
  for (const pod of data.pods) {
    console.log(`  📦 ${pod.name || pod.id}`)
    console.log(`     ID: ${pod.id}`)
    console.log(`     Status: ${pod.status}`)
    console.log(`     GPU: ${pod.gpuType} × ${pod.gpuCount}`)
    console.log(`     Provider: ${pod.provider}`)
    if (pod.sshCommand) {
      console.log(`     SSH: ${pod.sshCommand}`)
    }
    console.log("")
  }

  return data.pods
}

// Create a pod
async function createPod(options: {
  name?: string
  gpuType?: string
  image?: string
}) {
  const { name = "genx-inference", gpuType = "A100_PCIE_40GB", image = "vllm_llama_8b" } = options

  console.log("\n🚀 Creating pod...\n")
  console.log(`   Name: ${name}`)
  console.log(`   GPU: ${gpuType}`)
  console.log(`   Image: ${image}`)
  console.log("")

  // First, find availability for this GPU type
  const availParams = new URLSearchParams({
    gpu_type: gpuType,
    gpu_count: "1",
  })

  const availResponse = await fetch(`${API_BASE}/availability/gpus?${availParams}`, { headers })
  if (!availResponse.ok) {
    console.error("Failed to check availability:", await availResponse.text())
    return
  }

  const offers = await availResponse.json()

  if (!offers.length) {
    console.error(`No ${gpuType} GPUs available. Try a different GPU type.`)
    console.log("\nAvailable GPU types:")
    await listAvailability()
    return
  }

  // Pick the first available offer
  const offer = offers.find((o: any) => o.stockStatus === "Available") || offers[0]

  console.log(`   Using offer: ${offer.cloudId} from ${offer.provider}`)
  console.log(`   Data center: ${offer.dataCenter} (${offer.country})`)
  console.log(`   Price: $${offer.prices?.onDemand}/hr`)
  console.log("")

  // Check if the selected image is available
  const availableImages = offer.images || []
  const selectedImage = availableImages.includes(image) ? image : availableImages[0]

  if (selectedImage !== image) {
    console.log(`   ⚠️  Image "${image}" not available, using "${selectedImage}" instead`)
  }

  const body = {
    pod: {
      name,
      cloudId: offer.cloudId,
      gpuType: offer.gpuType,
      socket: offer.socket,
      gpuCount: offer.gpuCount || 1,
      image: selectedImage,
      dataCenterId: offer.dataCenter,
      country: offer.country,
      security: offer.security || "secure_cloud",
    },
    provider: {
      type: offer.provider,
    },
  }

  console.log("   Request body:", JSON.stringify(body, null, 2))
  console.log("")

  const response = await fetch(`${API_BASE}/pods/`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Failed to create pod:", response.status, error)
    return
  }

  const pod = await response.json()

  console.log("✅ Pod created successfully!\n")
  console.log(`   ID: ${pod.id}`)
  console.log(`   Status: ${pod.status}`)
  console.log("")
  console.log("   The pod is now provisioning. Run this to check status:")
  console.log(`   npx tsx scripts/provision.ts pods`)
  console.log("")
  console.log("   Once ready, SSH with:")
  console.log(`   ssh -i ~/.ssh/id_rsa user@<pod-ip>`)
  console.log("")

  return pod
}

// Delete a pod
async function deletePod(podId: string) {
  console.log(`\n🗑️  Deleting pod ${podId}...\n`)

  const response = await fetch(`${API_BASE}/pods/${podId}`, {
    method: "DELETE",
    headers,
  })

  if (!response.ok) {
    console.error("Failed to delete pod:", response.status, await response.text())
    return
  }

  console.log("✅ Pod deleted successfully!")
}

// Main
async function main() {
  const [, , command, ...args] = process.argv

  switch (command) {
    case "list":
      await listAvailability(args[0])
      break

    case "pods":
      await listPods()
      break

    case "create":
      await createPod({
        name: args[0] || "genx-inference",
        gpuType: args[1] || "A100_PCIE_40GB",
        image: args[2] || "vllm_llama_8b",
      })
      break

    case "delete":
      if (!args[0]) {
        console.error("Usage: npx tsx scripts/provision.ts delete <pod_id>")
        process.exit(1)
      }
      await deletePod(args[0])
      break

    default:
      console.log(`
Prime Intellect GPU Provisioning

Commands:
  list [gpu_type]     List available GPUs (e.g., list A100_PCIE_40GB)
  pods                List your pods
  create [name] [gpu] [image]  Create a pod
  delete <pod_id>     Delete a pod

Examples:
  npx tsx scripts/provision.ts list
  npx tsx scripts/provision.ts list H100_80GB
  npx tsx scripts/provision.ts create my-pod A100_PCIE_40GB vllm_llama_8b
  npx tsx scripts/provision.ts pods
  npx tsx scripts/provision.ts delete pod_abc123

Environment:
  PRIME_API_KEY       Your Prime Intellect API key (required)
`)
  }
}

main().catch(console.error)
