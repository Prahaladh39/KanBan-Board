Kanban Board
A real-time, full-stack Kanban board built with React.js, Node.js, Express.js, and Socket.IO for task management and collaboration. This app allows users to create, update, delete, and move tasks between columns with a drag-and-drop interface.
Deployment: https://kanban-eight-pi.vercel.app/
Note: There is a 50-second delay when adding the first card in the app. The card will take this time to be displayed after it’s created. This delay only occurs during the first card creation. Subsequent cards will appear immediately without any delay.

Features
Real-time Collaboration: Tasks are updated across all clients in real-time using Socket.IO.
Task Management: Create, edit, delete tasks, and drag them between columns (To Do, In Progress, Done).
File Attachments: Attach files to tasks to keep relevant information organized.
Priority and Category Settings: Set priority and categories for each task to better manage workflow.
Task Progress Visualization: View task progress with a simple chart.

Tech Stack
Frontend: React.js
Backend: Node.js, Express.js, Socket.IO
Testing: Playwright (End-to-End Testing), Vitest (Unit Testing)

Installation
To run the Kanban board locally:

Clone the repository:
Copy
Edit
git clone https://github.com/Prahaladh39/KanBan-Board

Navigate to the project folder:
Copy
Edit
cd kanban-board

Install the dependencies:
Copy
Edit
npm install
Start the backend:

bash
Copy
Edit
npm run server

Start the frontend:
Copy
Edit
npm run dev

Start the backend
node server.js

Visit http://localhost:3000 to access the app
