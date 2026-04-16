import React from "react";
import room from "../../assets/room.png"
import chat from "../../assets/chat.png"

function Features() {
  return (
    <div className="bg-[#eef8f7] py-20 px-6 md:px-20">

      <div className="max-w-6xl mx-auto mb-16 text-center md:text-left">

        {/* Small Label */}
        <p className="text-sm tracking-[0.2em] text-orange-400 font-medium mb-4">
          TRIPMATE — KEY FEATURES
        </p>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
          Everything your{" "}
          <span className="text-orange-400 italic font-medium">
            journey
          </span>{" "}
          needs, in one place.
        </h1>

      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE (IMAGE BACKGROUND STYLE) */}
        <div className="h-[350px] md:h-[450px] rounded-2xl overflow-hidden">
          <img
            src="https://plus.unsplash.com/premium_photo-1682310071124-33632135b2ee?q=80&w=2112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="travel"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div>
          <p className="text-orange-500 font-semibold mb-2">
            Live & Effortless
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Real-Time Location Sharing
          </h2>

          <div className="w-16 h-1 bg-orange-500 mb-6"></div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Stay connected with your roommates, always. TravelMate streams live GPS locations on a shared map so you always know where everyone is — no pinging, no waiting, no guessing.
          </p>

          
        </div>

        {/* LEFT SIDE (IMAGE BACKGROUND STYLE) */}
        <div className="h-[350px] md:h-[450px] rounded-2xl overflow-hidden">
          <img
            src={room}
            alt="travel"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div>
          <p className="text-orange-500 font-semibold mb-2">
            Effortless Organisation
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Room & Group Management
          </h2>

          <div className="w-16 h-1 bg-orange-500 mb-6"></div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Create a room, share an invite link, and your crew is connected instantly. Manage members, assign roles, and even belong to multiple groups — all from one clean dashboard.
          </p>

        </div>

        {/* LEFT SIDE (IMAGE BACKGROUND STYLE) */}
        <div className="h-[350px] md:h-[450px] rounded-2xl overflow-hidden">
          <img
            src={chat}
            alt="travel"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div>
          <p className="text-orange-500 font-semibold mb-2">
            Live & Smart
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Realtime Chat
          </h2>

          <div className="w-16 h-1 bg-orange-500 mb-6"></div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            This feature enables seamless and instant communication between users within the platform. It allows users to send and receive messages without the need to refresh the page, providing a smooth and interactive user experience.
          </p>

        </div>

        {/* LEFT SIDE (ANIMATED SOS UI) */}
        <div className="h-[350px] md:h-[450px] rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-red-900 via-black to-red-800 relative">

            {/* PULSE RINGS */}
            <div className="absolute w-40 h-40 bg-red-500 rounded-full animate-ping opacity-30"></div>
            <div className="absolute w-56 h-56 bg-red-500 rounded-full animate-ping opacity-20 delay-200"></div>
            <div className="absolute w-72 h-72 bg-red-500 rounded-full animate-ping opacity-10 delay-500"></div>

            {/* MAIN SOS BUTTON */}
            <div className="relative z-10 flex flex-col items-center">
                
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                SOS
                </div>

                <p className="text-white mt-4 text-center text-sm opacity-80">
                Emergency Alert System
                </p>

            </div>

        </div>

        {/* RIGHT SIDE CONTENT */}
        <div>
          <p className="text-orange-500 font-semibold mb-2">
            Safety First
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            SOS Emergency Alert
          </h2>

          <div className="w-16 h-1 bg-orange-500 mb-6"></div>

          <p className="text-gray-600 mb-6 leading-relaxed">
           One tap. Every roommate gets your exact location, instantly. Whether you feel unsafe or just need help fast, TravelMate's SOS feature puts your safety circle on alert in seconds.
          </p>

        </div>




      </div>
    </div>
  );
}

export default Features;