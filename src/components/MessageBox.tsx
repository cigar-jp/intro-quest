interface MessageBoxProps {
  message: string;
}

export function MessageBox({ message }: MessageBoxProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#0a1929] border-t-4 border-white p-6">
      <div className="relative">
        {/* ドラクエ風の枠 */}
        <div className="absolute -inset-2 border-4 border-white rounded pointer-events-none" />
        <div className="absolute -inset-1 border-2 border-[#0a1929] rounded pointer-events-none" />
        
        {/* メッセージテキスト */}
        <div className="relative text-white font-mono text-base leading-relaxed whitespace-pre-line">
          {message}
        </div>
        
        {/* 三角カーソル */}
        <div className="absolute bottom-0 right-0 animate-pulse">
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-white" />
        </div>
      </div>
      
      {/* Enterで閉じる表示 */}
      <div className="text-right text-xs text-gray-400 mt-2 font-mono">
        ▼ Enterで閉じる
      </div>
    </div>
  );
}
