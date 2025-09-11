import { MonacoEditor } from './MonacoEditor';
import { ThemeFile } from '../types/editor-types';
import { useEditorAnimations } from '../styles/useEditorAnimations';

interface EditorMainAreaProps {
  activeFile: ThemeFile | null;
  theme: 'vs-dark' | 'vs-light';
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  onContentChange: (content: string) => void;
  onEditorReady: () => void;
  onError: (error: any) => void;
}

export const EditorMainArea = ({
  activeFile,
  theme,
  fontSize,
  wordWrap,
  minimap,
  onContentChange,
  onEditorReady,
  onError,
}: EditorMainAreaProps) => {
  const animations = useEditorAnimations();

  return (
    <div className={`flex-1 flex flex-col ${animations.mainArea}`}>
      <MonacoEditor
        file={activeFile}
        theme={theme}
        fontSize={fontSize}
        wordWrap={wordWrap}
        minimap={minimap}
        onContentChange={onContentChange}
        onEditorReady={onEditorReady}
        onError={onError}
      />
    </div>
  );
};
