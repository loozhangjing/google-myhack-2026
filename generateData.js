import fs from 'fs';
import path from 'path';

const firstNames = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Oliver", "Isabella", "Elijah", "Sophia", "William", "Mia", "Lucas", "Charlotte", "Benjamin", "Amelia", "Theodore", "Harper", "Mateo", "Evelyn", "Levi", "Abigail", "Sebastian", "Emily", "Daniel", "Elizabeth", "Jack", "Mila", "Michael", "Ella", "Alexander", "Avery", "Owen", "Sofia", "Asher", "Camila", "Samuel", "Aria", "Ethan", "Scarlett", "Leo", "Victoria", "Jackson", "Madison", "Mason", "Luna", "Ezra", "Grace", "John", "Chloe", "David", "Penelope", "Wyatt", "Layla", "Matthew", "Riley", "Luke", "Zoey", "Ashton", "Nora", "Carter", "Lily", "Isaac", "Eleanor", "Jayden", "Hannah", "Gabriel", "Lillian", "Anthony", "Addison", "Dylan", "Aubrey", "Lincoln", "Ellie", "Thomas", "Stella", "Maverick", "Natalie", "Charles", "Zoe", "Josiah", "Leah", "Hudson", "Hazel", "Christian", "Violet", "Hunter", "Aurora", "Elias", "Savannah", "Aaron", "Audrey", "Eli", "Brooklyn", "Landon", "Bella", "Adrian", "Claire", "Jonathan", "Skylar"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez"];

const companies = ["Google", "Meta", "Apple", "Amazon", "Netflix", "Stripe", "Plaid", "OpenAI", "Anthropic", "Vercel", "Cloudflare", "GitHub", "Microsoft", "Uber", "Airbnb", "Snowflake", "Databricks", "Scale AI", "Hugging Face", "Discord", "Twitch", "Spotify", "Coinbase", "Kraken", "Binance", "Robinhood", "Citadel", "Jane Street", "Two Sigma", "Jump Trading", "Palantir", "Anduril", "SpaceX", "Tesla", "Rivian", "Lucid", "Nvidia", "AMD", "Intel", "Qualcomm", "Broadcom", "TSMC", "ASML", "Samsung", "Sony", "Nintendo", "Epic Games", "Unity", "Roblox", "Electronic Arts"];

const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "London, UK", "Berlin, Germany", "Remote", "Hybrid", "Tokyo, Japan", "Singapore", "Toronto, Canada", "Chicago, IL", "Boston, MA", "Los Angeles, CA"];

const skillCategories = [
    {
        name: "Systems Engineering",
        roles: ["Systems Engineer", "Kernel Developer", "C++ Engineer", "Rust Developer", "Embedded Engineer", "Performance Engineer"],
        skills: ["C", "C++", "Rust", "Zig", "Assembly", "Linux Kernel", "eBPF", "TCP/IP", "POSIX", "Multithreading", "Memory Management", "CUDA", "LLVM", "Compiler Design", "RTOS"],
        buzzwords: ["low-latency", "bare-metal", "lock-free", "zero-cost abstractions", "kernel bypass", "hardware acceleration"]
    },
    {
        name: "Machine Learning",
        roles: ["ML Engineer", "AI Researcher", "Data Scientist", "Computer Vision Engineer", "NLP Engineer", "LLM Specialist"],
        skills: ["Python", "PyTorch", "TensorFlow", "JAX", "CUDA", "Triton", "Hugging Face", "Transformers", "OpenCV", "Scikit-Learn", "Pandas", "NumPy", "Ray", "ONNX", "Deep Learning"],
        buzzwords: ["fine-tuning", "distributed training", "model inference", "RAG architectures", "gradient descent", "neural networks"]
    },
    {
        name: "Frontend Development",
        roles: ["Frontend Engineer", "UI Engineer", "Web Developer", "Creative Developer", "React Developer", "Svelte Developer"],
        skills: ["JavaScript", "TypeScript", "React", "Svelte", "Vue", "Angular", "Next.js", "Nuxt", "Tailwind CSS", "WebGL", "Three.js", "Framer Motion", "GSAP", "RxJS", "Redux"],
        buzzwords: ["pixel-perfect", "micro-interactions", "zero-JS hydration", "accessibility", "responsive design", "state management"]
    },
    {
        name: "Backend Development",
        roles: ["Backend Engineer", "API Developer", "Distributed Systems Engineer", "Java Developer", "Go Developer", "Node.js Engineer"],
        skills: ["Node.js", "Go", "Java", "Spring Boot", "Python", "Django", "FastAPI", "Rust", "PostgreSQL", "MongoDB", "Redis", "Kafka", "RabbitMQ", "GraphQL", "gRPC"],
        buzzwords: ["high-throughput", "event-driven", "microservices", "ACID compliance", "eventual consistency", "CQRS"]
    },
    {
        name: "DevOps & SRE",
        roles: ["DevOps Engineer", "Site Reliability Engineer", "Platform Engineer", "Cloud Architect", "Infrastructure Engineer"],
        skills: ["Kubernetes", "Docker", "Terraform", "Ansible", "AWS", "GCP", "Azure", "CI/CD", "GitHub Actions", "Prometheus", "Grafana", "ELK Stack", "ArgoCD", "Istio", "Bash"],
        buzzwords: ["zero-downtime", "infrastructure as code", "chaos engineering", "observability", "high availability", "auto-scaling"]
    },
    {
        name: "Mobile Development",
        roles: ["iOS Engineer", "Android Engineer", "Mobile Developer", "React Native Developer", "Flutter Developer"],
        skills: ["Swift", "Kotlin", "Objective-C", "Java", "React Native", "Flutter", "Dart", "SwiftUI", "Jetpack Compose", "CoreData", "Realm", "Firebase", "App Store Connect"],
        buzzwords: ["native modules", "smooth 60fps", "offline-first", "battery optimization", "app architecture", "declarative UI"]
    }
];

const levels = ["Junior", "Mid-Level", "Senior", "Staff", "Principal", "Lead"];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
    return arr[randomInt(0, arr.length - 1)];
}

function generateSkills(category, count) {
    const skills = [];
    while (skills.length < count) {
        const skill = randomItem(category.skills);
        if (!skills.includes(skill)) skills.push(skill);
    }
    return skills;
}

function generateTalentProfile(id) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const category = randomItem(skillCategories);
    const level = randomItem(levels);
    const role = randomItem(category.roles);
    
    let historyCount = level === "Junior" ? 1 : level === "Mid-Level" ? 2 : 3;
    const history = [];
    let endYear = 2024;
    for (let i = 0; i < historyCount; i++) {
        const startYear = endYear - randomInt(1, 4);
        history.push({
            role: i === 0 ? `${level} ${role}` : randomItem(category.roles),
            company: randomItem(companies),
            years: `${startYear} - ${i === 0 ? 'Present' : endYear}`
        });
        endYear = startYear;
    }

    const expertise = generateSkills(category, randomInt(3, 6));
    const buzzword = randomItem(category.buzzwords);
    
    let bio = "";
    if (level === "Junior") {
        bio = `Passionate and eager ${role} focusing on ${buzzword}. Recently contributed to several open-source projects using ${expertise[0]} and ${expertise[1]}.`;
    } else if (level === "Senior" || level === "Lead") {
        bio = `Experienced ${role} with a track record of building ${buzzword} systems. Led teams at ${history[0]?.company || 'tech companies'} utilizing ${expertise.join(', ')}.`;
    } else {
        bio = `Skilled ${role} specializing in ${expertise[0]} and ${expertise[1]}. Deep knowledge of ${buzzword} and scalable architecture.`;
    }

    return {
        id,
        name: `${firstName} ${lastName}`,
        role: `${level} ${role}`,
        expertise,
        history,
        bio,
        image: ""
    };
}

function generateJobProfile(id) {
    const company = randomItem(companies);
    const category = randomItem(skillCategories);
    const level = randomItem(levels);
    const role = randomItem(category.roles);
    
    const expertise = generateSkills(category, randomInt(4, 7));
    const buzzword = randomItem(category.buzzwords);
    
    let bio = `Join ${company} as a ${level} ${role}. We are looking for someone with deep expertise in ${expertise[0]} and ${expertise[1]} to help us build ${buzzword} solutions. `;
    if (level === "Senior" || level === "Staff" || level === "Principal") {
        bio += `You will mentor junior engineers and architect core systems.`;
    } else {
        bio += `Great opportunity for growth and working with cutting-edge tech.`;
    }

    return {
        id,
        name: company,
        role: `${level} ${role}`,
        expertise,
        history: [
            { role: "Team Size", company: `${randomItem(["1-5", "5-15", "15-30", "50+"])}`, years: "Full-Time" },
            { role: "Location", company: randomItem(locations), years: randomItem(["Remote", "Hybrid", "On-site"]) }
        ],
        bio,
        image: ""
    };
}

const numToGenerate = 250;

const talentProfiles = [];
const jobProfiles = [];

for (let i = 0; i < numToGenerate; i++) {
    talentProfiles.push(generateTalentProfile(3000 + i));
    jobProfiles.push(generateJobProfile(3000 + i));
}

const talentFilePath = path.join(process.cwd(), 'src/lib/talent.ts');
const jobsFilePath = path.join(process.cwd(), 'src/lib/jobs.ts');

const talentFileContent = fs.readFileSync(talentFilePath, 'utf-8');
const jobsFileContent = fs.readFileSync(jobsFilePath, 'utf-8');

const updatedTalentFileContent = talentFileContent.replace(
    /];\s*$/, 
    `\n  // --- GENERATED PROFILES ---\n  ${talentProfiles.map(p => JSON.stringify(p, null, 2).replace(/\n/g, '\n  ')).join(',\n  ')}\n];`
);

const updatedJobsFileContent = jobsFileContent.replace(
    /];\s*$/, 
    `\n  // --- GENERATED PROFILES ---\n  ${jobProfiles.map(p => JSON.stringify(p, null, 2).replace(/\n/g, '\n  ')).join(',\n  ')}\n];`
);

fs.writeFileSync(talentFilePath, updatedTalentFileContent, 'utf-8');
fs.writeFileSync(jobsFilePath, updatedJobsFileContent, 'utf-8');

console.log('Successfully added 250 talent profiles and 250 job profiles.');
