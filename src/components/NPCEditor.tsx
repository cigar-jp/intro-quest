import { useState } from 'react';
import { NPC } from '../App';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface NPCEditorProps {
  npcs: NPC[];
  onUpdateNPC: (id: number, message: string) => void;
}

export function NPCEditor({ npcs, onUpdateNPC }: NPCEditorProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempMessage, setTempMessage] = useState('');

  const handleEdit = (npc: NPC) => {
    setEditingId(npc.id);
    setTempMessage(npc.message);
  };

  const handleSave = () => {
    if (editingId !== null) {
      onUpdateNPC(editingId, tempMessage);
      setEditingId(null);
      setTempMessage('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempMessage('');
  };

  return (
    <Card className="p-4 bg-white shadow-xl border-2">
      <h2 className="mb-4">NPC セリフ編集</h2>
      <div className="space-y-4">
        {npcs.map(npc => (
          <div key={npc.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: npc.color }}
                />
                <span>{npc.name}</span>
              </div>
              {editingId !== npc.id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(npc)}
                >
                  編集
                </Button>
              )}
            </div>
            
            {editingId === npc.id ? (
              <div className="space-y-2">
                <Label htmlFor={`npc-${npc.id}`}>セリフ</Label>
                <Textarea
                  id={`npc-${npc.id}`}
                  value={tempMessage}
                  onChange={(e) => setTempMessage(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                  placeholder="NPCのセリフを入力\n改行も使えます"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 font-mono whitespace-pre-line bg-gray-50 p-2 rounded">
                {npc.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
