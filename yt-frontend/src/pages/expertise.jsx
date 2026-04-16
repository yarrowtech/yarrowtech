
// import React from "react";
// import "./expertise.css";

// /* LOGOS */
// const reactLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg";
// const nextLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg";
// const tailwindLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg";

// const angularLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg";
// const vueLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg";
// const jsLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg";
// const bootstrapLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg";

// const nodeLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg";
// const expressLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg";
// const djangoLogo = "https://w7.pngwing.com/pngs/10/113/png-transparent-django-web-development-web-framework-python-software-framework-django-text-trademark-logo-thumbnail.png";
// const flaskLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg";

// const mongoLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg";
// const mysqlLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg";
// const firebaseLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg";
// const postgresLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg";

// const awsLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg";
// const dockerLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg";
// const githubLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg";

// const figmaLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg";
// const xdLogo = "https://upload.wikimedia.org/wikipedia/commons/c/c2/Adobe_XD_CC_icon.svg";

// const flutterLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg";
// const kotlinLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg";
// const reactNativeLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg";
// const swiftLogo = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg";

// /* DARK LOGOS → Need white background */
// const darkLogos = [
//   "Express.js",
//   "GitHub",
//   "Flask",
//   "Next.js",
//   "Django",
//   "Node.js",
//   "AWS"
// ];

// export default function ExpertisePage() {

//   const expertise = [
//     {
//       title: "Frontend Development",
//       tools: [
//         { name: "React", logo: reactLogo },
//         { name: "Next.js", logo: nextLogo },
//         { name: "Tailwind CSS", logo: tailwindLogo },
//         { name: "Angular", logo: angularLogo },
//         { name: "Vue.js", logo: vueLogo },
//         { name: "JavaScript", logo: jsLogo },
//         { name: "Bootstrap", logo: bootstrapLogo },
//       ],
//     },
//     {
//       title: "Backend Engineering",
//       tools: [
//         { name: "Node.js", logo: nodeLogo },
//         { name: "Express.js", logo: expressLogo },
//         { name: "Django", logo: djangoLogo },
//         { name: "Flask", logo: flaskLogo },
//       ],
//     },
//     {
//       title: "App Development",
//       tools: [
//         { name: "Flutter", logo: flutterLogo },
//         { name: "Kotlin", logo: kotlinLogo },
//         { name: "React Native", logo: reactNativeLogo },
//         { name: "Swift", logo: swiftLogo },
//       ],
//     },
//     {
//       title: "Database Systems",
//       tools: [
//         { name: "MongoDB", logo: mongoLogo },
//         { name: "MySQL", logo: mysqlLogo },
//         { name: "Firebase", logo: firebaseLogo },
//         { name: "PostgreSQL", logo: postgresLogo },
//       ],
//     },
//     {
//       title: "Cloud & DevOps",
//       tools: [
//         { name: "AWS", logo: awsLogo },
//         { name: "Docker", logo: dockerLogo },
//         { name: "GitHub", logo: githubLogo },
//       ],
//     },
//     {
//       title: "UI/UX & Design",
//       tools: [
//         { name: "Figma", logo: figmaLogo },
//         { name: "Adobe XD", logo: xdLogo },
//       ],
//     },
//   ];

//   return (
//     <section id="expertise" className="expertise-section">
//       <div className="container">

//         <h2 className="title">Our Expertise</h2>
//         <p className="subtitle">The technologies and tools that power our innovation and creativity.</p>

//         {expertise.map((cat, i) => (
//           <div key={i} className="expertise-row-inline">

//             <div className="title-wrapper">
//               <h3 className="expertise-title-inline">{cat.title}</h3>
//               <div className="title-divider"></div>
//             </div>

//             <div className="scroll-inline">
//               <div className="scroll-inline-track">

//                 {cat.tools.map((tool, index) => (
//                   <div className="tool-inline" key={index}>
//                     <img
//                       src={tool.logo}
//                       className={`tool-inline-logo ${
//                         darkLogos.includes(tool.name) ? "white-bg-logo" : ""
//                       }`}
//                     />
//                     <span className="tool-inline-name">{tool.name}</span>
//                   </div>
//                 ))}

//                 {cat.tools.map((tool, index) => (
//                   <div className="tool-inline" key={"dup-" + index}>
//                     <img
//                       src={tool.logo}
//                       className={`tool-inline-logo ${
//                         darkLogos.includes(tool.name) ? "white-bg-logo" : ""
//                       }`}
//                     />
//                     <span className="tool-inline-name">{tool.name}</span>
//                   </div>
//                 ))}

//               </div>
//             </div>
//           </div>
//         ))}

//       </div>
//     </section>
//   );
// }





import React from "react";
import "./expertise.css";

/* DARK LOGOS */
const darkLogos = [
  "Express.js",
  "GitHub",
  "Flask",
  "Next.js",
  "Django",
  "Node.js",
  "AWS",
];

export default function ExpertisePage() {
  const expertise = [
    {
      title: "Frontend Development",
      tools: [
        { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
        { name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
        { name: "Tailwind CSS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
        { name: "Angular", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
        { name: "Vue.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
        { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
        { name: "Bootstrap", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
      ],
    },
    {
      title: "Backend Engineering",
      tools: [
        { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
        { name: "Express.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
        { name: "Django", logo: "https://w7.pngwing.com/pngs/10/113/png-transparent-django-web-development-web-framework-python-software-framework-django-text-trademark-logo-thumbnail.png" },
        { name: "Flask", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
      ],
    },
    {
      title: "App Development",
      tools: [
        { name: "Flutter", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" },
        { name: "Kotlin", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" },
        { name: "React Native", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
        { name: "Swift", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" },
      ],
    },
    {
      title: "Database Systems",
      tools: [
        { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
        { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
        { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
        { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
      ],
    },
    {
      title: "Cloud & DevOps",
      tools: [
        { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
        { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
        { name: "GitHub", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
      ],
    },
    {
      title: "UI/UX & Design",
      tools: [
        { name: "Figma", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
        { name: "Adobe XD", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Adobe_XD_CC_icon.svg" },
      ],
    },
  ];

  return (
    <section id="expertise" className="expertise-section">
      <div className="container">
        <h2 className="title">Our Expertise</h2>
        <p className="subtitle">
          The technologies and tools that power our innovation and creativity.
        </p>

        {expertise.map((cat, i) => (
          <div key={i} className="expertise-row-inline">
            <div className="title-wrapper">
              <h3 className="expertise-title-inline">{cat.title}</h3>
              <div className="title-divider" />
            </div>

            <div className="scroll-inline">
              <div className="scroll-inline-track">
                {[...cat.tools, ...cat.tools].map((tool, index) => (
                  <div className="tool-inline" key={index}>
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className={`tool-inline-logo ${
                        darkLogos.includes(tool.name) ? "white-bg-logo" : ""
                      }`}
                    />
                    <span className="tool-inline-name">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
