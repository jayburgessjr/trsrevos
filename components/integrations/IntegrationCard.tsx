type IntegrationCardProps = {
  provider: string;
  description: string;
  connected: boolean;
  lastSync: string;
  onConnect: () => void;
  onDisconnect: () => void;
};

export default function IntegrationCard({ provider, description, connected, lastSync, onConnect, onDisconnect }: IntegrationCardProps) {
  return (
    <div className="border rounded-lg p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold">{provider}</h2>
        <p className="text-gray-500">{description}</p>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Status: {connected ? "Connected" : "Not Connected"}</p>
          <p className="text-sm text-gray-500">Last Sync: {lastSync}</p>
        </div>
        <div className="mt-4 flex gap-2">
          {connected ? (
            <button onClick={onDisconnect} className="w-full bg-red-500 text-white py-2 rounded-lg">Disconnect</button>
          ) : (
            <button onClick={onConnect} className="w-full bg-blue-500 text-white py-2 rounded-lg">Connect</button>
          )}
          <button className="w-full bg-gray-200 py-2 rounded-lg">Test</button>
        </div>
      </div>
    </div>
  );
}
