// TestErrorUsingReactErrorBoundary.tsx

const TestErrorBoundry = () => {
  throw new Error("Testing async error forwarded to ErrorBoundary");
};

export default TestErrorBoundry;
