# --- CONFIGURATION ---
$PACKAGE_JSON_PATH = ".\package.json"
$NAMESPACE = "isinv"
$DEPLOYMENT_NAME = "isinv-front"

# --- 1. AUTO-INCREMENT VERSION ---
$VERSION_FILE = "version.json"
$versionData = Get-Content $VERSION_FILE | ConvertFrom-Json
$currentVersion = [version]$versionData.version

# Increment Patch
$newVersion = [version]::new($currentVersion.Major, $currentVersion.Minor, ($currentVersion.Build + 1))

# Save back to version.json (Format doesn't matter as much here, but we'll keep it clean)
$versionData.version = $newVersion.ToString()
$versionData | ConvertTo-Json | Set-Content $VERSION_FILE

$IMAGE_NAME = "ghcr.io/oak06/isinv-front:$newVersion"
echo "New version set: $newVersion"

# --- 2. FETCH SECRETS ---
echo "--- Fetching secrets from Kubernetes ---"
function Get-K8sSecret($key) {
    $base64 = kubectl get secret isinv-env -n $NAMESPACE -o jsonpath="{.data.$key}"
    return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($base64))
}

$BACKEND = "https://api.isinv.ubqsolutions.org"
$BASE    = "https://isinv.ubqsolutions.org"
$TINY    = Get-K8sSecret "NEXT_PUBLIC_TINY_MCE_KEY"

# --- 3. BUILD ---
echo "--- Building Docker Image $IMAGE_NAME ---"
docker build `
  --build-arg BACKEND_URL="$BACKEND" `
  --build-arg BASE_URL="$BASE" `
  --build-arg TINY_KEY="$TINY" `
  -t $IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
  $newVersion = [version]::new($currentVersion.Major, $currentVersion.Minor, ($currentVersion.Build - 1))
  $versionData.version = $newVersion.ToString()
  $versionData | ConvertTo-Json | Set-Content $VERSION_FILE
  throw "Docker build failed"
}

# --- 4. PUSH ---
echo "--- Pushing to GHCR ---"
docker push $IMAGE_NAME
if ($LASTEXITCODE -ne 0) {
  throw "Docker push failed - aborting before deploy"
}

# --- 5. DEPLOY & RESTART ---
echo "--- Deploying to Kubernetes ---"
kubectl apply -f .\kube\deployment.yaml -n $NAMESPACE
kubectl apply -f .\kube\service.yaml -n $NAMESPACE

# Force the deployment to use the specific new version
kubectl set image deployment/$DEPLOYMENT_NAME $DEPLOYMENT_NAME=$IMAGE_NAME -n $NAMESPACE
kubectl rollout restart deployment/$DEPLOYMENT_NAME -n $NAMESPACE

echo "--- Done! Successfully deployed version $newVersion ---"
