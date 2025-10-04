export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
  rawText: string;
}

export const parseResume = async (file: File): Promise<ParsedResume> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      // Extract email
      const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
      const email = emailMatch ? emailMatch[0] : '';
      
      // Extract phone
      const phoneMatch = text.match(/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
      const phone = phoneMatch ? phoneMatch[0] : '';
      
      // Extract name (usually first line or before email)
      const lines = text.split('\n').filter(line => line.trim());
      const name = lines[0]?.trim() || '';
      
      // Extract skills (common keywords)
      const skillKeywords = ['skills', 'technical skills', 'core competencies'];
      const skills: string[] = [];
      skillKeywords.forEach(keyword => {
        const skillSection = text.toLowerCase().indexOf(keyword);
        if (skillSection !== -1) {
          const afterSkills = text.substring(skillSection + keyword.length, skillSection + 300);
          const skillMatches = afterSkills.match(/[A-Za-z+#.]+/g) || [];
          skills.push(...skillMatches.slice(0, 10));
        }
      });
      
      // Extract experience
      const experienceKeywords = ['experience', 'work experience', 'employment'];
      const experience: string[] = [];
      experienceKeywords.forEach(keyword => {
        const expSection = text.toLowerCase().indexOf(keyword);
        if (expSection !== -1) {
          const afterExp = text.substring(expSection, expSection + 500);
          const expLines = afterExp.split('\n').slice(1, 6);
          experience.push(...expLines.filter(line => line.trim()));
        }
      });
      
      // Extract education
      const educationKeywords = ['education', 'academic', 'qualification'];
      const education: string[] = [];
      educationKeywords.forEach(keyword => {
        const eduSection = text.toLowerCase().indexOf(keyword);
        if (eduSection !== -1) {
          const afterEdu = text.substring(eduSection, eduSection + 300);
          const eduLines = afterEdu.split('\n').slice(1, 4);
          education.push(...eduLines.filter(line => line.trim()));
        }
      });
      
      // Create summary from first few lines
      const summary = lines.slice(1, 4).join(' ').substring(0, 200);
      
      resolve({
        name,
        email,
        phone,
        skills: [...new Set(skills)].slice(0, 15),
        experience: experience.slice(0, 5),
        education: education.slice(0, 3),
        summary,
        rawText: text,
      });
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const generateCustomResume = (parsedResume: ParsedResume, jobTitle: string, jobDescription: string): string => {
  const relevantSkills = parsedResume.skills.filter(skill => 
    jobDescription.toLowerCase().includes(skill.toLowerCase())
  );
  
  return `
# ${parsedResume.name}
${parsedResume.email} | ${parsedResume.phone}

## Professional Summary
Experienced professional seeking ${jobTitle} position. ${parsedResume.summary}

## Key Skills Relevant to ${jobTitle}
${relevantSkills.length > 0 ? relevantSkills.join(' • ') : parsedResume.skills.slice(0, 8).join(' • ')}

## Experience
${parsedResume.experience.join('\n')}

## Education
${parsedResume.education.join('\n')}

---
*This resume has been customized for the ${jobTitle} position*
  `.trim();
};
