import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative h-[320px] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-lg">
      <div className="absolute inset-0">
        <Spline 
          scene="https://prod.spline.design/VyGeZv58yuk8j7Yy/scene.splinecode" 
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          JSON Tree Visualizer
        </h1>
        <p className="mt-2 max-w-2xl text-sm md:text-base text-gray-200">
          Paste JSON, generate a beautiful tree, search by path, and explore interactively.
        </p>
      </div>
    </section>
  )
}
