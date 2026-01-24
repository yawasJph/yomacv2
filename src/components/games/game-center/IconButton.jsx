const IconButton = ({ children, onClick }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
    >
        {children}
    </button>
);

export default IconButton