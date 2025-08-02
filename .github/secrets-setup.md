# 🔐 GitHub Secrets Setup Guide

This guide explains how to configure GitHub Secrets for secure Firebase deployment without exposing API keys in your repository.

## 📋 Required GitHub Secrets

The following secrets must be configured in your GitHub repository for the CI/CD workflows to function properly:

### Firebase Configuration Secrets

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSyDO96Ih6M8oLIsIeyQXkDkHBT1O_oyU5Yo` |
| `FIREBASE_AUTH_DOMAIN` | Firebase Authentication Domain | `your-project-id.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project-id.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging Sender ID | `123456789012` |
| `FIREBASE_APP_ID` | Firebase Web App ID | `1:123456789012:web:abc123def456...` |
| `FIREBASE_MEASUREMENT_ID` | Google Analytics Measurement ID | `G-ABC123DEF4` |
| `FIREBASE_SERVICE_ACCOUNT_UVBUNNY_APP` | Firebase Service Account Key (JSON) | `{"type": "service_account", ...}` |

## 🚀 Step-by-Step Setup Instructions

### Step 1: Get Firebase Configuration Values

#### Option A: From Firebase Console (Recommended)

1. **Navigate to Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project

2. **Get Web App Configuration**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - Click on your web app or add a new one if none exists
   - Copy the Firebase configuration object:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",              // FIREBASE_API_KEY
     authDomain: "project.firebaseapp.com", // FIREBASE_AUTH_DOMAIN
     projectId: "your-project-id",     // FIREBASE_PROJECT_ID
     storageBucket: "project.firebasestorage.app", // FIREBASE_STORAGE_BUCKET
     messagingSenderId: "123456789",   // FIREBASE_MESSAGING_SENDER_ID
     appId: "1:123456789:web:abc123...", // FIREBASE_APP_ID
     measurementId: "G-ABC123DEF"      // FIREBASE_MEASUREMENT_ID
   };
   ```

#### Option B: From Local Environment File

If you already have a working local environment file:

1. **Open your local environment file**
   ```bash
   cat src/environments/environment.ts
   ```

2. **Extract the values** from the firebaseConfig object

### Step 2: Get Firebase Service Account Key

1. **Navigate to Service Accounts**
   - In Firebase Console, go to Project Settings
   - Click on "Service accounts" tab
   - Click "Generate new private key"

2. **Download the JSON file**
   - Save the downloaded JSON file securely
   - **NEVER commit this file to your repository**

3. **Copy the entire JSON content**
   - Open the downloaded JSON file
   - Copy the entire content (it should start with `{"type": "service_account"...}`)

### Step 3: Add Secrets to GitHub Repository

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click on "Settings" tab
   - In the left sidebar, click "Secrets and variables" > "Actions"

2. **Add Each Secret**
   
   Click "New repository secret" for each of the following:

   #### FIREBASE_API_KEY
   ```
   Name: FIREBASE_API_KEY
   Secret: [Your Firebase API Key]
   ```

   #### FIREBASE_AUTH_DOMAIN
   ```
   Name: FIREBASE_AUTH_DOMAIN
   Secret: [Your Firebase Auth Domain]
   ```

   #### FIREBASE_PROJECT_ID
   ```
   Name: FIREBASE_PROJECT_ID
   Secret: [Your Firebase Project ID]
   ```

   #### FIREBASE_STORAGE_BUCKET
   ```
   Name: FIREBASE_STORAGE_BUCKET
   Secret: [Your Firebase Storage Bucket]
   ```

   #### FIREBASE_MESSAGING_SENDER_ID
   ```
   Name: FIREBASE_MESSAGING_SENDER_ID
   Secret: [Your Firebase Messaging Sender ID]
   ```

   #### FIREBASE_APP_ID
   ```
   Name: FIREBASE_APP_ID
   Secret: [Your Firebase App ID]
   ```

   #### FIREBASE_MEASUREMENT_ID
   ```
   Name: FIREBASE_MEASUREMENT_ID
   Secret: [Your Firebase Measurement ID]
   ```

   #### FIREBASE_SERVICE_ACCOUNT_UVBUNNY_APP
   ```
   Name: FIREBASE_SERVICE_ACCOUNT_UVBUNNY_APP
   Secret: [Entire JSON content of service account key]
   ```

## ✅ Verification Steps

### Step 1: Check Secrets Configuration

1. **View Configured Secrets**
   - Go to repository Settings > Secrets and variables > Actions
   - Verify all 8 secrets are listed
   - Secret values are hidden for security

### Step 2: Test the Workflows

1. **Create a Test Commit**
   ```bash
   # Make a small change and push to main
   echo "# Test deployment" >> README.md
   git add README.md
   git commit -m "test: verify CI/CD setup"
   git push origin main
   ```

2. **Monitor the Workflow**
   - Go to "Actions" tab in your GitHub repository
   - Watch the "Deploy to Firebase Hosting on merge" workflow
   - Check for any errors in the "Validate required secrets" step

3. **Test PR Preview**
   ```bash
   # Create and push a feature branch
   git checkout -b test-pr-preview
   echo "# Test PR preview" >> README.md
   git add README.md
   git commit -m "test: verify PR preview deployment"
   git push origin test-pr-preview
   
   # Create a Pull Request on GitHub
   # Watch the "Deploy to Firebase Hosting on PR" workflow
   ```

## 🔧 Troubleshooting Common Issues

### Issue: "Missing required GitHub Secrets" Error

**Symptoms:**
```
❌ Missing required GitHub Secrets:
FIREBASE_API_KEY
FIREBASE_PROJECT_ID
```

**Solutions:**
1. **Check Secret Names**: Ensure exact spelling and case sensitivity
2. **Verify Secret Values**: Make sure secrets contain actual values, not placeholders
3. **Repository Permissions**: Ensure you have admin access to configure secrets

### Issue: Bash Syntax Errors in Workflows

**Symptoms:**
```
/bin/bash: line 1: [: too many arguments
Error: Process completed with exit code 2
```

**Solutions:**
1. **Updated Workflows**: The current workflows use environment variables instead of direct secret interpolation
2. **Validation Script**: Run `.github/validate-workflows.sh` locally to check for syntax issues
3. **Proper Quoting**: All secret values are now properly escaped and quoted

### Issue: "Firebase Service Account Error"

**Symptoms:**
```
Error: Failed to initialize Firebase Admin SDK
```

**Solutions:**
1. **Regenerate Service Account Key**:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate a new private key
   - Update the `FIREBASE_SERVICE_ACCOUNT_UVBUNNY_APP` secret

2. **Check JSON Format**:
   - Ensure the entire JSON object is copied
   - Verify no extra characters or line breaks

3. **Verify Permissions**:
   - Ensure the service account has "Firebase Admin SDK Admin Service Agent" role

### Issue: "Build Fails After Secrets Setup"

**Symptoms:**
```
❌ environment.ts has incorrect structure
```

**Solutions:**
1. **Check Firebase Config Values**:
   - Verify all Firebase config values are correct
   - Ensure no typos in domain names or IDs

2. **Validate JSON Syntax**:
   - Use an online JSON validator for the service account key
   - Ensure proper escaping of special characters

### Issue: "Deployment Succeeds but App Doesn't Work"

**Symptoms:**
- Deployment completes successfully
- Application loads but Firebase features don't work
- Console shows Firebase connection errors

**Solutions:**
1. **Check Firebase Project Settings**:
   - Ensure Firestore and Storage are properly configured
   - Verify security rules allow access

2. **Validate Environment Values**:
   - Double-check each Firebase config value
   - Ensure project ID matches your actual Firebase project

3. **Test Local Configuration**:
   - Update your local environment files with the same values
   - Test locally to isolate the issue

## 🛡️ Security Best Practices

### Repository Security
- ✅ **Never commit** real API keys or service account files
- ✅ **Use GitHub Secrets** for all sensitive configuration
- ✅ **Regularly rotate** service account keys
- ✅ **Monitor** repository access and permissions

### Firebase Security
- ✅ **Configure Firestore Security Rules** before production
- ✅ **Set up Firebase Storage Rules** for file uploads
- ✅ **Enable Firebase App Check** for additional security
- ✅ **Monitor Firebase Usage** for unexpected activity

### CI/CD Security
- ✅ **Limit workflow permissions** to minimum required
- ✅ **Use specific action versions** instead of latest
- ✅ **Review workflow logs** for sensitive data exposure
- ✅ **Clean up environment files** after build (already implemented)

## 📞 Getting Help

### Resources
- **Firebase Documentation**: [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- **GitHub Actions**: [Encrypted Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- **Firebase CLI**: [Official Documentation](https://firebase.google.com/docs/cli)

### Common Commands

```bash
# Check current Firebase project
firebase projects:list

# Login to Firebase CLI
firebase login

# Get current project info
firebase use

# Test Firebase configuration locally
firebase emulators:start

# Validate workflow files locally
./.github/validate-workflows.sh
```

### Workflow Validation

Before committing changes to workflow files, run the validation script:

```bash
# Make the script executable (if needed)
chmod +x .github/validate-workflows.sh

# Run validation
./.github/validate-workflows.sh
```

This script checks for:
- YAML syntax errors
- Bash syntax errors in embedded scripts
- Common GitHub Actions issues
- Proper secret handling patterns

### Support Channels
- **Project Issues**: [GitHub Issues](https://github.com/goldbergoanna/uvbunny-app/issues)
- **Firebase Support**: [Firebase Support](https://firebase.google.com/support)
- **GitHub Actions**: [GitHub Community Forum](https://github.community)

---

## 📝 Checklist for Setup Completion

Use this checklist to ensure everything is properly configured:

- [ ] **Firebase Console Access**
  - [ ] Can access Firebase project
  - [ ] Web app is configured
  - [ ] Service account key downloaded

- [ ] **GitHub Secrets Configuration**
  - [ ] `FIREBASE_API_KEY` added
  - [ ] `FIREBASE_AUTH_DOMAIN` added
  - [ ] `FIREBASE_PROJECT_ID` added
  - [ ] `FIREBASE_STORAGE_BUCKET` added
  - [ ] `FIREBASE_MESSAGING_SENDER_ID` added
  - [ ] `FIREBASE_APP_ID` added
  - [ ] `FIREBASE_MEASUREMENT_ID` added
  - [ ] `FIREBASE_SERVICE_ACCOUNT_UVBUNNY_APP` added

- [ ] **Workflow Testing**
  - [ ] Main branch deployment works
  - [ ] PR preview deployment works
  - [ ] No secrets exposed in logs
  - [ ] Application functions correctly after deployment

- [ ] **Security Verification**
  - [ ] Local environment files excluded from git
  - [ ] No real API keys in repository history
  - [ ] Firebase security rules configured
  - [ ] Service account permissions limited

**🎉 Setup Complete!** Your repository now has secure CI/CD deployment without exposing sensitive credentials.

---

*Generated by the UVbunny Firebase Security Setup - Last updated: $(date)*