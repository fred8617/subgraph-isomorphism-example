import Graph from "./Graph";
import "antd/dist/antd.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ height: `100vh` }}>
        <Graph />
      </div>
    </QueryClientProvider>
  );
}

export default App;
