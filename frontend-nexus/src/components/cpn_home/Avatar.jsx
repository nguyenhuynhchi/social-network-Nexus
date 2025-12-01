export default function Avatar({ size = 50 }) {
  return (
    <img
      src="https://res.cloudinary.com/dbkbsz3vy/image/upload/v1764345414/images/nrypgpldc4qp22gkiodo.jpg"
      alt="avatar"
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
