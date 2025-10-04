import { ParsedResume } from './resumeParser';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  status: 'pending' | 'applying' | 'applied' | 'failed';
  description: string;
  url: string;
  appliedAt?: Date;
  customResume?: string;
}

const jobTemplates = [
  {
    titles: ['Software Engineer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer'],
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Uber'],
    descriptions: [
      'Build scalable web applications using modern technologies. Work with cross-functional teams.',
      'Design and implement robust backend systems. Experience with cloud platforms required.',
      'Create beautiful user interfaces with React and TypeScript. Strong CSS skills needed.',
      'Develop microservices architecture. Knowledge of Docker and Kubernetes preferred.',
    ],
  },
  {
    titles: ['Data Analyst', 'Business Analyst', 'Data Scientist', 'ML Engineer'],
    companies: ['IBM', 'Oracle', 'SAP', 'Salesforce', 'Adobe', 'Tableau', 'DataBricks'],
    descriptions: [
      'Analyze large datasets to derive actionable insights. Proficiency in SQL and Python required.',
      'Build predictive models using machine learning algorithms. Experience with TensorFlow preferred.',
      'Create data visualizations and dashboards. Strong communication skills needed.',
      'Work with big data technologies. Experience with Spark and Hadoop is a plus.',
    ],
  },
  {
    titles: ['Product Manager', 'Project Manager', 'Scrum Master', 'Program Manager'],
    companies: ['LinkedIn', 'Twitter', 'Slack', 'Atlassian', 'Asana', 'Monday.com'],
    descriptions: [
      'Lead product development from conception to launch. Strong stakeholder management required.',
      'Coordinate agile teams and ensure timely delivery. Certified Scrum Master preferred.',
      'Define product roadmap and prioritize features. Experience in SaaS products needed.',
      'Manage multiple projects simultaneously. PMP certification is a plus.',
    ],
  },
];

const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Remote', 'Hybrid'];
const salaryRanges = ['$80k - $120k', '$100k - $150k', '$120k - $180k', '$90k - $130k', '$110k - $160k'];

export const generatePersonalizedJobs = (
  parsedResume: ParsedResume,
  preferences: {
    jobTitle: string;
    location: string;
    jobType: string;
    salaryMin: number;
    salaryMax: number;
  }
): Job[] => {
  const jobs: Job[] = [];
  
  // Find relevant job category based on resume and preferences
  const relevantTemplate = jobTemplates.find(template =>
    template.titles.some(title => 
      title.toLowerCase().includes(preferences.jobTitle.toLowerCase()) ||
      preferences.jobTitle.toLowerCase().includes(title.toLowerCase())
    )
  ) || jobTemplates[0];

  // Generate 10 personalized jobs
  for (let i = 0; i < 10; i++) {
    const title = relevantTemplate.titles[Math.floor(Math.random() * relevantTemplate.titles.length)];
    const company = relevantTemplate.companies[Math.floor(Math.random() * relevantTemplate.companies.length)];
    const description = relevantTemplate.descriptions[Math.floor(Math.random() * relevantTemplate.descriptions.length)];
    
    // Calculate match score based on skills overlap
    const jobSkillKeywords = description.toLowerCase().split(' ');
    const matchingSkills = parsedResume.skills.filter(skill =>
      jobSkillKeywords.some(keyword => keyword.includes(skill.toLowerCase()))
    );
    const matchScore = Math.min(95, 60 + matchingSkills.length * 5 + Math.floor(Math.random() * 10));

    jobs.push({
      id: `job-${Date.now()}-${i}`,
      title,
      company,
      location: preferences.location === 'Any' ? locations[Math.floor(Math.random() * locations.length)] : preferences.location,
      salary: salaryRanges[Math.floor(Math.random() * salaryRanges.length)],
      match: matchScore,
      status: 'pending',
      description: `${description}\n\nRequired Skills: ${parsedResume.skills.slice(0, 5).join(', ')}`,
      url: `https://www.linkedin.com/jobs/view/${Math.floor(Math.random() * 1000000000)}`,
      appliedAt: undefined,
      customResume: undefined,
    });
  }

  // Sort by match score
  return jobs.sort((a, b) => b.match - a.match);
};
