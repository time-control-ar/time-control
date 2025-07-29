import { BoldIcon, ItalicIcon, UnderlineIcon, ListIcon, ListOrderedIcon } from 'lucide-react'
import { Editor } from '@tiptap/react'
import { EditorContent } from '@tiptap/react'

interface EventFormDescriptionProps {
    editor: Editor | null;
}

export function EventFormDescription({ editor }: EventFormDescriptionProps) {
    return (
        <div className='w-full flex flex-col gap-1'>
            <label className="label-input">Descripción</label>
            <div className="flex flex-col w-full gap-2">
                <div className="flex gap-2">
                    <button
                        type="button"
                        className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                    >
                        <BoldIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>

                    <button
                        type="button"
                        className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                    >
                        <ItalicIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>

                    <button
                        type="button"
                        className={`p-2 rounded ${editor?.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                        onClick={() => editor?.chain().focus().toggleMark('underline').run()}
                    >
                        <UnderlineIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>

                    <button
                        type="button"
                        className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        title="Lista con viñetas"
                    >
                        <ListIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>

                    <button
                        type="button"
                        className={`p-2 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        title="Lista numerada"
                    >
                        <ListOrderedIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <EditorContent editor={editor} />
            </div>
        </div>
    )
}