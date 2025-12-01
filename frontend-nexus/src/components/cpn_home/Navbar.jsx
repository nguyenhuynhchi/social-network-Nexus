export default function Navbar() {
  return (
    <div className="w-full h-16 bg-blue-400 flex items-center border-b-2 border-gray-500">

      <div className="w-[250px] text-3xl font-bold tracking-widest">
        <img
          src="../../src/assets/logo_nexus_nobackground.png"
          alt="logo"
          className="h-15 object-contain"
        />
      </div>

      <div className="flex ml-auto flex-1 text-white text-2xl justify-evenly w-full">
        <i className="fa-solid fa-house cursor-pointer"></i>
        <i className="fa-solid fa-users cursor-pointer"></i>
        <i className="fa-solid fa-comments cursor-pointer"></i>
      </div>

      <div className="w-[250px] text-3xl font-bold tracking-widest">
        <img
          src={"https://res.cloudinary.com/dbkbsz3vy/image/upload/v1764345414/images/nrypgpldc4qp22gkiodo.jpg"}
          alt="avatar"
          className="w-12 h-12 float-right rounded-full object-cover"
        />
      </div>


    </div>
  );
}