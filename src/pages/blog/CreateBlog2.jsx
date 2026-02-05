import React from "react";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

const CreateBlog2 = () => {
   const editor = useEditor({
    extensions: [StarterKit], // define your extension array
    content: '<p>Hello World!</p>', // initial content
  })
  return (
    <div >
      <SimpleEditor/>
    </div>
  );
};

export default CreateBlog2;
