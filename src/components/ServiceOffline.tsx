import React from 'react';
import { AlertCircle, RefreshCw, Cpu, Database } from 'lucide-react';

interface ServiceOfflineProps {
  serviceName: 'Config' | 'Core';
  port: number;
  onRetry: () => void;
}

export const ServiceOffline: React.FC<ServiceOfflineProps> = ({
  serviceName,
  port,
  onRetry,
}) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-500/10 bg-[#161214]/60 p-8 text-center backdrop-blur-md shadow-2xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-6 relative">
        <AlertCircle size={32} className="animate-pulse" />
        <div className="absolute inset-0 rounded-2xl border border-red-500/20 animate-ping opacity-25" />
      </div>

      <h2 className="text-xl font-semibold tracking-wide text-white mb-2">
        {serviceName} Service Unavailable
      </h2>
      <p className="max-w-md text-sm text-gray-400 mb-6 leading-relaxed">
        We were unable to establish a connection with the local <span className="font-mono text-gray-300">http://localhost:{port}</span> endpoint. 
        Please verify that the {serviceName} microservice is running and listening on port {port}.
      </p>

      <div className="mb-6 w-full max-w-sm rounded-lg bg-[#0c0d12] border border-[#1a1c23] p-4 text-left font-mono text-xs text-gray-500 space-y-2">
        <div className="flex items-center gap-2">
          {serviceName === 'Config' ? <Cpu size={12} /> : <Database size={12} />}
          <span className="font-bold text-gray-400">STATUS CHECK:</span>
        </div>
        <div className="flex justify-between">
          <span>Endpoint:</span>
          <span className="text-red-400">Connection Refused</span>
        </div>
        <div className="flex justify-between">
          <span>Port:</span>
          <span>{port}</span>
        </div>
        <div className="flex justify-between">
          <span>Action Required:</span>
          <span className="text-gray-300">Run backend binary</span>
        </div>
      </div>

      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/35 transition-all"
      >
        <RefreshCw size={14} className="animate-spin-slow" />
        Retry Connection
      </button>
    </div>
  );
};
