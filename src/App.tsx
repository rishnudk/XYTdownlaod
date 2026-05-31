import { useState } from 'react';

function App() {
  return (
    <div className="w-[400px] h-[500px] p-4 bg-background text-foreground flex flex-col items-center justify-center space-y-4 border rounded shadow">
      <h1 className="text-xl font-bold">Media Downloader</h1>
      <p className="text-sm text-muted-foreground">Go to X or YouTube to download media.</p>
    </div>
  );
}

export default App;
