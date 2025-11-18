# Rampa App

Development setup and getting started guide for the Rampa mobile application.

## 🚀 Quick Start

```bash
# Clone the repository
git clone git@github.com:rampa-cash/rampa-app.git
cd rampa-app

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env  # Edit with your credentials

# Start development server
npx expo start
```

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

### System Requirements

- **Node.js** (LTS version) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git**

### Platform-Specific Requirements

#### For iOS Development (macOS only)

- **macOS** with Xcode installed
- **Xcode** (latest version recommended) - [Download from App Store](https://apps.apple.com/us/app/xcode/id497799835)
- **Xcode Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`

#### For Android Development

- **Android Studio** - [Download](https://developer.android.com/studio)
- **Android SDK** (API 21+)
- **Java Development Kit (JDK)** 17 or later
- **Android Emulator** (optional, for testing)

> For detailed environment setup instructions, see:
> - [iOS Environment Setup](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated&mode=development-build&buildEnv=local)
> - [Android Environment Setup](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=development-build&buildEnv=local)

## 🛠 Environment Setup

### iOS Setup (macOS only)

1. **Install Xcode**
   - Download from the Mac App Store
   - Open Xcode and accept the license agreement
   - Install additional components when prompted

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

3. **Install iOS Dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Verify Setup**
   ```bash
   npx expo run:ios
   ```

### Android Setup

1. **Install Android Studio**
   - Download from [developer.android.com/studio](https://developer.android.com/studio)
   - During installation, ensure "Android SDK", "Android SDK Platform", and "Android Virtual Device" are selected

2. **Configure Android SDK**
   - Open Android Studio
   - Go to **Preferences** → **Appearance & Behavior** → **System Settings** → **Android SDK**
   - Install Android SDK Platform 33 (or latest)
   - Install Android SDK Build-Tools

3. **Set Environment Variables**
   
   Add to your `~/.zshrc` or `~/.bash_profile`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

4. **Verify Setup**
   ```bash
   # Check Android SDK
   adb version
   
   # Run on Android
   npx expo run:android
   ```

## 📦 Installation

1. **Clone the repository**
    ```bash
    git clone git@github.com:rampa-cash/rampa-app.git
    cd rampa-app
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Configure environment variables**

    Create a `.env` file in the root directory:
    ```env
    EXPO_PUBLIC_PARA_API_KEY=your_para_api_key
    EXPO_PUBLIC_API_URL=https://staging-api.rampacash.com/v1
    ```

4. **Install iOS dependencies** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

## 🏃 Running the App

### Start Development Server

1. Run expo start
    ```bash
    npx expo start
    ```

This will start the Metro bundler and display a QR code in your terminal.

### Running on Different Platforms

#### iOS Simulator (macOS only)

```bash
# Press 'i' in the terminal after starting expo
# Or run directly:
npx expo run:ios
```

#### Android Emulator

```bash
# Press 'a' in the terminal after starting expo
# Or run directly:
npx expo run:android
```

#### Physical Device

1. Ensure your device and computer are on the same Wi-Fi network
2. Scan the QR code displayed in the terminal with:
   - **iOS**: Camera app (opens in Expo Go)
   - **Android**: Expo Go app

#### Troubleshooting Connection Issues

If you can't connect to the development server:

```bash
# Use tunnel mode (slower but works on restricted networks)
npx expo start --tunnel
```

> For more details, see [Expo's Start Developing Guide](https://docs.expo.dev/get-started/start-developing/)

## 🛠 Development Tools

### Expo CLI

Expo CLI is automatically available via `npx`. Common commands:

| Command | Description |
|---------|-------------|
| `npx expo start` | Start the development server |
| `npx expo start --tunnel` | Start with tunnel connection |
| `npx expo start --clear` | Start with cleared cache |
| `npx expo run:ios` | Build and run on iOS simulator |
| `npx expo run:android` | Build and run on Android emulator |
| `npx expo prebuild` | Generate native Android and iOS directories |
| `npx expo install <package>` | Install a library with compatible versions |
| `npx expo lint` | Run ESLint on project files |

> For more Expo CLI commands, see [Expo Tools Documentation](https://docs.expo.dev/develop/tools/)

### EAS CLI (Optional)

For building and deploying:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build for production
eas build --platform all
```

## 📁 Project Structure

```
rampa-app/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── (modals)/          # Modal screens
│   └── _layout.tsx        # Root layout
│
├── src/
│   ├── domain/            # Domain logic and services
│   ├── shared/            # Shared utilities and infrastructure
│   └── lib/               # Core libraries (API client, query client)
│
├── components/             # Shared UI components
├── hooks/                 # Custom React hooks
├── constants/             # App constants
├── tests/                 # Test files
└── specs/                 # Project specifications
```

## 📜 Available Scripts

```bash
# Development
npm start                  # Start Expo development server
npm run ios                # Run on iOS simulator
npm run android            # Run on Android emulator
npm run web                # Run in web browser

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript type checking
npm run format             # Format code with Prettier
npm run format:check        # Check code formatting

# Testing
npm test                   # Run Jest tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate test coverage report
npm run test:e2e           # Run Detox E2E tests
npm run test:e2e:build     # Build for E2E tests
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests (requires build first)
npm run test:e2e:build
npm run test:e2e
```

### Test Structure

- **Unit Tests**: `tests/services/` - Service layer tests
- **Component Tests**: `tests/components/` - React component tests
- **Integration Tests**: `tests/integration/` - API integration tests
- **E2E Tests**: `tests/e2e/` - End-to-end user journey tests

## 🚀 Deployment

### Building with EAS

The project uses EAS Build for creating production builds.

    ```bash
# Build for staging
    eas build --platform all --profile staging

# Build for production
    eas build --platform all --profile production
    ```

Configuration is in `eas.json`. See [EAS Build Documentation](https://docs.expo.dev/build/introduction/) for more details.

## 🔧 Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
npx expo start --clear
```

**iOS build issues:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Android build issues:**
```bash
cd android
./gradlew clean
cd ..
```

**TypeScript errors:**
```bash
npm run type-check
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

**Private Repository - All rights reserved**
