# Rampa - Empowering families

**Rampa** is a modern cross-border remittance platform built on the Solana blockchain, enabling users to send and receive money instantly and at low cost. The platform also provides financial education, investment learning, and empowers users with control over their money through a secure, non-custodial wallet experience.

## 🚀 Features

### Core Remittance Features

- **Instant Cross-Border Transfers**: Send money across borders within 30 seconds using SOL, USDC, or EURC on Solana
- **Secure Wallet Management**: Non-custodial MPC (Multi-Party Computation) wallets via Para service - no seed phrases to manage
- **Multiple Payment Methods**: Add funds via bank transfer, credit/debit cards, or mobile money
- **Cash Out Options**: Convert digital funds to traditional currency and withdraw to bank accounts
- **Contact Management**: Save and manage recipients for faster transfers

### Financial Education

- **Learning Modules**: Access articles, videos, and interactive content about personal finance and crypto fundamentals
- **Investment Education**: Learn advanced investment strategies and portfolio management
- **Gamified Learning**: Complete micro-learning modules with rewards and progress tracking
- **Financial Literacy Tools**: Improve financial knowledge with quizzes and practice simulations

### Security & Compliance

- **Soft KYC**: Email + phone verification for standard operations
- **Biometric Authentication**: Secure sensitive operations with fingerprint/face recognition
- **Transaction Limits**: Custom limits for verified users with risk management
- **Audit Trails**: Complete logging for all financial operations and security events

## 🛠 Tech Stack

### Core Technologies

- **React Native** 0.82.1 - Cross-platform mobile development
- **Expo SDK** ~54.0 - Development platform and tooling
- **TypeScript** 5.9.2 - Type-safe development
- **Expo Router** ~6.0 - File-based routing system

### Key Dependencies

- **@getpara/react-native-wallet** - Para SDK for MPC wallet management
- **@tanstack/react-query** - Server state management and data fetching
- **zustand** - Lightweight state management
- **React Navigation** - Navigation library
- **React Native Paper** - Material Design components
- **NativeWind** - Tailwind CSS for React Native
- **expo-secure-store** - Secure key-value storage
- **expo-local-authentication** - Biometric authentication
- **@react-native-async-storage/async-storage** - Async storage for app preferences

### Blockchain & Crypto

- **Solana Blockchain** - Underlying blockchain network
- **Supported Currencies**: SOL, USDC, EURC
- **Quick Crypto** - Cryptographic utilities

## 📁 Project Structure

```
rampa-app/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx      # Login screen with Para SDK
│   │   └── _layout.tsx
│   ├── (tabs)/            # Main tab navigation
│   │   ├── home.tsx       # Dashboard (wallet, transactions)
│   │   ├── send.tsx       # Send money screen
│   │   ├── learn.tsx      # Financial education
│   │   ├── invest.tsx     # Investment features
│   │   ├── explore.tsx    # Explore features
│   │   └── _layout.tsx
│   ├── (modals)/          # Modal screens
│   │   ├── add-money.tsx  # Add funds to wallet
│   │   ├── receive-money.tsx # Receive money (QR codes)
│   │   ├── cash-out.tsx   # Withdraw to bank
│   │   ├── contacts.tsx   # Contact management
│   │   ├── user-details.tsx # User profile
│   │   └── _layout.tsx
│   └── _layout.tsx        # Root layout
│
├── src/
│   ├── components/        # Reusable UI components
│   ├── services/          # Business logic services
│   │   ├── AuthService.ts
│   │   ├── TransactionService.ts
│   │   ├── ContactService.ts
│   │   ├── OnRampService.ts
│   │   ├── OffRampService.ts
│   │   ├── InvestmentService.ts
│   │   └── LearningService.ts
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   ├── lib/               # Core libraries
│   │   ├── apiClient.ts  # API client with authentication
│   │   ├── para.ts       # Para SDK integration
│   │   └── queryClient.ts # React Query configuration
│   ├── store/             # Zustand stores
│   │   └── authStore.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── User.ts
│   │   ├── Wallet.ts
│   │   ├── Transaction.ts
│   │   ├── Contact.ts
│   │   └── ...
│   └── utils/             # Utility functions
│       ├── biometricAuth.ts
│       ├── secureStorage.ts
│       ├── securityUtils.ts
│       ├── errorHandler.ts
│       ├── offlineManager.ts
│       └── pushNotifications.ts
│
├── specs/                 # Project specifications
│   └── 001-remittance-platform/
│       ├── spec.md        # Feature specification
│       ├── plan.md        # Implementation plan
│       └── tasks.md       # Task breakdown
│
├── tests/                 # Test files
│   ├── __mocks__/
│   ├── services/
│   ├── integration/
│   └── e2e/
│
└── components/             # Shared Expo components
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **React Native development environment**
    - For iOS: Xcode (Mac only)
    - For Android: Android Studio
- **Expo CLI** (installed globally or via npx)
- **Para SDK API Key** - Required for authentication and wallet management
- **Backend API Access** - Staging/development environment credentials

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
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

4. **Start the development server**
    ```bash
    npx expo start
    ```

### Running on Different Platforms

- **iOS Simulator**: Press `i` in the terminal or scan QR code with Expo Go
- **Android Emulator**: Press `a` in the terminal or scan QR code with Expo Go
- **Physical Device**: Scan QR code with Expo Go app (iOS/Android)
- **Development Build**: `npx expo run:ios` or `npx expo run:android`

## 🧪 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run Detox E2E tests
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Architecture Overview

The app follows a **frontend-only architecture** with the following principles:

1. **API-First**: All data comes from backend API calls - no local database
2. **Secure Storage**: Session tokens stored in Expo SecureStore, app preferences in AsyncStorage
3. **State Management**:
    - React Query for server state (API data)
    - Zustand for client state (auth, UI state)
4. **Routing**: Expo Router for file-based navigation
5. **Authentication**: Para SDK for MPC wallet creation and management

### Development Workflow

1. **Feature Development**: Follow the specification in `specs/001-remittance-platform/`
2. **Service Layer**: Implement business logic in `src/services/`
3. **Type Safety**: Define types in `src/types/` before implementation
4. **API Integration**: Use `src/lib/apiClient.ts` for all backend calls
5. **Testing**: Write tests alongside features

## 🔒 Security

### Security Features

- **MPC Wallets**: Non-custodial wallets via Para service - users control their keys
- **Biometric Auth**: Required for sensitive financial operations
- **Secure Storage**: Sensitive data encrypted using Expo SecureStore
- **HTTPS Communication**: All API calls over HTTPS with certificate pinning
- **Session Management**: Secure session token handling with automatic refresh
- **Soft KYC**: Email + phone verification for compliance

### Security Best Practices

- Never commit API keys or secrets to version control
- Use environment variables for configuration
- Implement proper error handling without exposing sensitive data
- Follow secure coding practices for financial operations
- Regular security audits and dependency updates

## 📱 Platform Support

- **iOS**: 13+ (iPhone and iPad)
- **Android**: API 21+ (Android 5.0+)
- **Web**: Experimental support via Expo web

## 🧩 Key Features Implementation

### Wallet Management

- Automatic wallet creation via Para SDK
- Multi-currency support (SOL, USDC, EURC)
- Real-time balance updates
- Transaction history

### Money Transfers

- Instant cross-border transfers on Solana
- Contact-based sending
- QR code receiving
- Transaction status tracking

### Financial Services

- On-ramp: Add funds via traditional payment methods
- Off-ramp: Convert to fiat and withdraw to bank accounts
- Investment education and learning modules
- Progress tracking and gamification

## 🧪 Testing

### Test Structure

- **Unit Tests**: Jest for service layer and utilities
- **Component Tests**: React Native Testing Library
- **Integration Tests**: API integration and service interactions
- **E2E Tests**: Detox for complete user journey testing

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

## 🚀 Deployment

### Build Configuration

The app uses **EAS Build** (Expo Application Services) for building production-ready apps.

1. **Configure EAS** (see `eas.json`)
2. **Build for staging**:
    ```bash
    eas build --platform all --profile staging
    ```
3. **Build for production**:
    ```bash
    eas build --platform all --profile production
    ```

### Environment-Specific Builds

- **Development**: Local development with Expo Go or dev client
- **Staging**: Pre-production testing environment
- **Production**: Live app store releases

## 📚 Additional Resources

- **Project Specification**: `specs/001-remittance-platform/spec.md`
- **Implementation Plan**: `specs/001-remittance-platform/plan.md`
- **Quickstart Guide**: `specs/001-remittance-platform/quickstart.md`
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Para SDK Documentation](https://docs.getpara.com/)

## 🤝 Contributing

This is a private project. For questions or contributions, please contact the development team.

## 📄 License

Private - All rights reserved

---

**Built with ❤️ using React Native, Expo, and Solana**
