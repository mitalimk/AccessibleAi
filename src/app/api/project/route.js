// app/api/project/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const projectsDir = path.join(process.cwd(), 'data', 'projects');
const dataDir = path.join(process.cwd(), 'data');

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('id');

    // Get all projects if no ID specified
    if (!projectId) {
      if (!fs.existsSync(projectsDir)) {
        return NextResponse.json({ projects: [] });
      }

      const projectFiles = fs.readdirSync(projectsDir)
        .filter(file => file.endsWith('.json'));

      const projects = projectFiles.map(file => {
        const projectPath = path.join(projectsDir, file);
        const projectData = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
        return {
          id: projectData.id,
          name: projectData.name,
          createdAt: projectData.createdAt,
          updatedAt: projectData.updatedAt
        };
      }).sort((a, b) => b.updatedAt - a.updatedAt);

      return NextResponse.json({ projects });
    }

    // Get specific project
    const projectPath = path.join(projectsDir, `${projectId}.json`);
    if (!fs.existsSync(projectPath)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectData = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
    return NextResponse.json({ project: projectData });
  } catch (error) {
    console.error('Error retrieving project data:', error);
    return NextResponse.json({ error: 'Failed to retrieve project data' }, { status: 500 });
  }
}

export async function POST(req) {
    try {
      const { action, projectId, projectName, simplifiedText, audioUrl, imageUrls } = await req.json();
      // Create projects directory if it doesn't exist
      if (!fs.existsSync(projectsDir)) {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir);
        }
        fs.mkdirSync(projectsDir);
      }
  
      // Handle different actions
      switch (action) {
        case 'create':
          // Create new project
          const newProjectId = Date.now().toString();
          const timestamp = Date.now();
          const newProject = {
            id: newProjectId,
            name: projectName || 'Untitled Project',
            createdAt: timestamp,
            updatedAt: timestamp,
            simplifiedText: simplifiedText || '',
            audioUrl: audioUrl || '',
            imageUrls: imageUrls || []
          };
  
          fs.writeFileSync(
            path.join(projectsDir, `${newProjectId}.json`),
            JSON.stringify(newProject, null, 2)
          );
  
          return NextResponse.json({ project: newProject });
  
        case 'update':
          // Update existing project
          if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
          }
  
          const projectPath = path.join(projectsDir, `${projectId}.json`);
          if (!fs.existsSync(projectPath)) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
          }
  
          const existingProject = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
          const updatedProject = {
            ...existingProject,
            name: projectName !== undefined ? projectName : existingProject.name,
            simplifiedText: simplifiedText !== undefined ? simplifiedText : existingProject.simplifiedText,
            audioUrl: audioUrl !== undefined ? audioUrl : existingProject.audioUrl,
            imageUrls: imageUrls !== undefined ? imageUrls : existingProject.imageUrls,
            updatedAt: Date.now()
          };
  
          fs.writeFileSync(
            projectPath,
            JSON.stringify(updatedProject, null, 2)
          );
  
          return NextResponse.json({ project: updatedProject });
  
        case 'delete':
          // Delete existing project
          if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
          }
  
          const projectToDeletePath = path.join(projectsDir, `${projectId}.json`);
          if (!fs.existsSync(projectToDeletePath)) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
          }
  
          fs.unlinkSync(projectToDeletePath);
          return NextResponse.json({ success: true });
  
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    } catch (error) {
      console.error('Error processing project action:', error);
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
  }