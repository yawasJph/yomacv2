import { EditorContent, useEditor } from "@tiptap/react";
import React from "react";

import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import { common, createLowlight } from "lowlight";
import CodeBlockNodev2 from "@/pages/blog/CodeBlockNodev2";



const ReadOnlyEditor = ({content}) => {
    const lowlight = createLowlight(common);
  const editor = useEditor({
    immediatelyRender: false,
    editable:false,
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
        codeBlock: true,
      }),
      // CodeBlockLowlight.configure({
      //   lowlight,
      // }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockNodev2);
        },
      }).configure({
        lowlight,

      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
    ],
    content,
  });

  return (
    <EditorContent
      editor={editor}
      role="presentation"
      className="simple-editor-content"
    />
  );
};

export default ReadOnlyEditor;
