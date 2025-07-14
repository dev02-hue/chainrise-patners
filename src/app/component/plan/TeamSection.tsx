'use client';
import { motion } from 'framer-motion';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaShareAlt } from 'react-icons/fa';
import Image from 'next/image';

const teamMembers = [
  {
    name: 'Ethan Coleman',
    title: 'FOUNDER',
    image: '/7fGoXFKQNtIxY7BekxXa1ZxwomAnIdf1ea0QoYol.jpg',
    socials: { facebook: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Henry Wright',
    title: 'Head Of Operations',
    image: '/mYm7lkdwlUOAM4Qcn5tBlxtEF6EJHLA7lGnxR36r.jpg',
    socials: { facebook: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Amelia Brooks',
    title: 'Head Of Marketing',
    image: '/vV2jU4e7iOebrM8urD9HDfK2JADwJJVjAgdWQZz9.jpg',
    socials: { facebook: '#', linkedin: '#', twitter: '#' },
  },
];

const TeamSection = () => {
  return (
    <section className="py-16 bg-white text-center">
      <h2 className="text-[#1c3f32] font-semibold mb-2 text-sm tracking-wide">
        &#128279; Our Team
      </h2>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1c3f32] mb-12">
        Your Business with the Professional
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 md:px-20">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            className="relative bg-white rounded-2xl shadow-md overflow-hidden group"
          >
            <div className="relative">
              <Image
                src={member.image}
                alt={member.name}
                width={500}
                height={400}
                className="w-full h-64 object-cover"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer">
                  <FaFacebookF className="text-white text-xl hover:text-blue-400" />
                </a>
                <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer">
                  <FaLinkedinIn className="text-white text-xl hover:text-blue-400" />
                </a>
                <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer">
                  <FaTwitter className="text-white text-xl hover:text-blue-400" />
                </a>
                <FaShareAlt className="text-white text-xl cursor-pointer" />
              </motion.div>
            </div>
            <div className="py-6">
              <h3 className="text-lg font-semibold text-[#1c3f32]">{member.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{member.title}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
