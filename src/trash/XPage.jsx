import React from 'react'

const XPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
    <div className="max-w-7xl mx-auto flex">
      {/* Layout 1: Sidebar Izquierdo - Navegación */}
      <aside className="w-64 fixed left-0 top-0 h-screen border-r border-gray-800 px-4 py-4 flex flex-col">
        {/* Logo */}
        <div className="mb-8">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1">
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25L2.25 7.5v9c0 5.25 3.75 10.125 9.75 11.25 6-1.125 9.75-6 9.75-11.25v-9L12 2.25zm0 2.25l7.5 4.5v7.5c0 4.125-2.625 7.875-7.5 8.625-4.875-.75-7.5-4.5-7.5-8.625V9L12 4.5z"/>
            </svg>
            <span className="text-xl">Inicio</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-8 6a8 8 0 1 1 16 0 8 8 0 0 1-16 0z"/>
              <path d="M10.5 2.5a8 8 0 0 0-8 8c0 4.418 3.582 8 8 8s8-3.582 8-8a8 8 0 0 0-8-8zm0 18c-5.523 0-10-4.477-10-10S4.977.5 10.5.5s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            <span className="text-xl">Explorar</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.53 7.47l-5-5a.75.75 0 0 0-1.06 0l-5 5a.749.749 0 0 0 0 1.06.75.75 0 0 0 1.06 0L11 5.06V16.5a.75.75 0 0 0 1.5 0V5.06l3.47 3.47a.75.75 0 1 0 1.06-1.06z"/>
              <path d="M19.5 14.5a.75.75 0 0 0-.75.75v2.25H5.25v-2.25a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 .75.75h14.25a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 0-.75-.75z"/>
            </svg>
            <span className="text-xl">Notificaciones</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a1.5 1.5 0 0 1-1.144 0L1.5 8.67z"/>
              <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z"/>
            </svg>
            <span className="text-xl">Mensajes</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 1.5 2.598l5.25 3.044a3 3 0 0 0 3 0l5.25-3.044a3 3 0 0 0 1.5-2.598V5.25a3 3 0 0 0-3-3H5.25zm1.5 1.5a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75zm3.75.75a.75.75 0 0 1 1.5 0v.75a.75.75 0 0 1-1.5 0V4.5zm3.75.75a.75.75 0 0 1 1.5 0v.75a.75.75 0 0 1-1.5 0V4.5z"/>
              <path d="M3.75 15.75v-4.5a.75.75 0 0 1 1.125-.65l5.25 3.044a.75.75 0 0 1 .375.65v4.5a.75.75 0 0 1-1.125.65l-5.25-3.044a.75.75 0 0 1-.375-.65zm8.25-4.5v4.5c0 .27.144.518.375.65l5.25 3.044a.75.75 0 0 0 1.125-.65v-4.5a.75.75 0 0 0-.375-.65l-5.25-3.044a.75.75 0 0 0-1.125.65z"/>
            </svg>
            <span className="text-xl">Listas</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.507 4.048A3 3 0 0 1 7.5 3h9a3 3 0 0 1 2.493 1.048L21.75 6l-2.757 8.276A3 3 0 0 1 16.5 17.25h-9a3 3 0 0 1-2.493-1.974L2.25 6l3.257-1.952zM7.5 4.5a1.5 1.5 0 0 0-1.247.524L4.28 6.75h15.44l-1.973-1.726A1.5 1.5 0 0 0 16.5 4.5h-9zM3.75 8.25v7.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-7.5H3.75z"/>
            </svg>
            <span className="text-xl">Guardados</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0L2.53 11.47a.75.75 0 0 0 1.06 1.06l8.88-8.69z"/>
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432z"/>
            </svg>
            <span className="text-xl">Perfil</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z" clipRule="evenodd"/>
            </svg>
            <span className="text-xl">Más opciones</span>
          </a>
        </nav>

        {/* Botón Publicar */}
        <button className="w-full bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200 transition-colors mb-4">
          Publicar
        </button>

        {/* Perfil Usuario */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-lg">U</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Usuario</p>
            <p className="text-sm text-gray-500">@usuario</p>
          </div>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z" clipRule="evenodd"/>
          </svg>
        </div>
      </aside>

      {/* Layout 2: Feed Central - Publicaciones */}
      <main className="flex-1 ml-64 border-r border-gray-800 min-h-screen">
        {/* Header del Feed */}
        <header className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 z-10">
          <h2 className="text-xl font-bold">Inicio</h2>
        </header>

        {/* Área de Publicación */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
              <span className="text-lg">U</span>
            </div>
            <div className="flex-1">
              <textarea
                placeholder="¿Qué está pasando?"
                className="w-full bg-transparent text-xl placeholder-gray-500 resize-none outline-none min-h-[120px]"
              ></textarea>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4 text-blue-500">
                  <button className="hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3l9.75 4.5M12 12.75h.008v.008H12v-.008z"/>
                    </svg>
                  </button>
                  <button className="hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button className="hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"/>
                    </svg>
                  </button>
                  <button className="hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base wrap-break-word">
                {isMobile ? (
                  <span>{post.profiles.full_name} sanchez aldair llacuash mercdes escobar pablo</span>
                ) : !isMe ? (
                  <UserHoverCard user={post.profiles}>
                    <span className="hover:underline cursor-pointer">
                      {post.profiles.full_name}
                    </span>
                  </UserHoverCard>
                ) : (
                  <span>{post.profiles.full_name}</span>
                )}
              </h3>
              

              <p
                className="text-sm text-gray-500 dark:text-gray-400"
                title={new Date(post.created_at).toLocaleString("es-PE")}
              >
                {isMobile
                  ? timeAgoTiny(post.created_at)
                  : timeAgoLong(post.created_at)}
              </p>
            </div>

            <button className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <MoreHorizontal size={18} />
            </button>
           
          </div>

        {/* Feed de Publicaciones */}
        <div className="divide-y divide-gray-800">
          {/* Publicación 1 */}
          <article className="p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                <span className="text-lg">A</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">Ana García</span>
                  <span className="text-gray-500">@anagarcia</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">2h</span>
                </div>
                <p className="mb-3">¡Acabo de terminar mi proyecto! Estoy muy emocionada con los resultados. #DesarrolloWeb #React</p>
                <div className="flex items-center gap-6 text-gray-500">
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.15 6.138 6.23l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                    </svg>
                    <span>24</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                    </svg>
                    <span>156</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                    </svg>
                    <span>892</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                    </svg>
                    <span>45</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Publicación 2 */}
          <article className="p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                <span className="text-lg">C</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">Carlos López</span>
                  <span className="text-gray-500">@carlosdev</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">5h</span>
                </div>
                <p className="mb-3">Nuevo tutorial de React Hooks disponible. Aprende a usar useState, useEffect y más. Link en mi perfil 👇</p>
                <div className="flex items-center gap-6 text-gray-500">
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.15 6.138 6.23l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                    </svg>
                    <span>89</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                    </svg>
                    <span>234</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                    </svg>
                    <span>1.2K</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                    </svg>
                    <span>67</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Publicación 3 */}
          <article className="p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                <span className="text-lg">M</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">María Rodríguez</span>
                  <span className="text-gray-500">@mariarod</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">1d</span>
                </div>
                <p className="mb-3">Acabo de descubrir una nueva librería de UI increíble. Definitivamente vale la pena probarla. ¿Alguien más la ha usado?</p>
                <div className="flex items-center gap-6 text-gray-500">
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.15 6.138 6.23l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                    </svg>
                    <span>12</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                    </svg>
                    <span>45</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                    </svg>
                    <span>567</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                    </svg>
                    <span>23</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      {/* Layout 3: Sidebar Derecho - Tendencias y Sugerencias */}
      <aside className="w-80 hidden lg:block p-4 space-y-4">
        {/* Buscar */}
        <div className="sticky top-4">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar"
              className="w-full bg-gray-900 border border-gray-800 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:bg-black"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* Tendencias */}
          <div className="bg-gray-900 rounded-2xl mb-4">
            <div className="p-4">
              <h3 className="text-xl font-bold mb-4">Tendencias para ti</h3>
              <div className="space-y-4">
                <div className="hover:bg-gray-800/50 p-3 rounded-lg cursor-pointer transition-colors">
                  <p className="text-sm text-gray-500">Tendencia en Tecnología</p>
                  <p className="font-bold">#ReactJS</p>
                  <p className="text-sm text-gray-500">125K posts</p>
                </div>
                <div className="hover:bg-gray-800/50 p-3 rounded-lg cursor-pointer transition-colors">
                  <p className="text-sm text-gray-500">Tendencia en Desarrollo</p>
                  <p className="font-bold">#JavaScript</p>
                  <p className="text-sm text-gray-500">89K posts</p>
                </div>
                <div className="hover:bg-gray-800/50 p-3 rounded-lg cursor-pointer transition-colors">
                  <p className="text-sm text-gray-500">Tendencia en Programación</p>
                  <p className="font-bold">#WebDev</p>
                  <p className="text-sm text-gray-500">67K posts</p>
                </div>
                <div className="hover:bg-gray-800/50 p-3 rounded-lg cursor-pointer transition-colors">
                  <p className="text-sm text-gray-500">Tendencia en Diseño</p>
                  <p className="font-bold">#UIUX</p>
                  <p className="text-sm text-gray-500">45K posts</p>
                </div>
              </div>
            </div>
          </div>

          {/* A quién seguir */}
          <div className="bg-gray-900 rounded-2xl">
            <div className="p-4">
              <h3 className="text-xl font-bold mb-4">A quién seguir</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between hover:bg-gray-800/50 p-3 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span>JD</span>
                    </div>
                    <div>
                      <p className="font-bold">Juan Díaz</p>
                      <p className="text-sm text-gray-500">@juandiaz</p>
                    </div>
                  </div>
                  <button className="bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm">
                    Seguir
                  </button>
                </div>
                <div className="flex items-center justify-between hover:bg-gray-800/50 p-3 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span>LS</span>
                    </div>
                    <div>
                      <p className="font-bold">Laura Sánchez</p>
                      <p className="text-sm text-gray-500">@laurasan</p>
                    </div>
                  </div>
                  <button className="bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm">
                    Seguir
                  </button>
                </div>
                <div className="flex items-center justify-between hover:bg-gray-800/50 p-3 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span>PM</span>
                    </div>
                    <div>
                      <p className="font-bold">Pedro Martínez</p>
                      <p className="text-sm text-gray-500">@pedromart</p>
                    </div>
                  </div>
                  <button className="bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm">
                    Seguir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
  )
}

export default XPage