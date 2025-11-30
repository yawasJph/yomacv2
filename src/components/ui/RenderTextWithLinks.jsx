import React from 'react'

const RenderTextWithLinks = ({text}) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline break-all"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
}

export default RenderTextWithLinks