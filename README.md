# CalorIQ – Personal Fitness & Nutrition Tracker

**Your Health, In Focus.**

CalorIQ is a personalized fitness and nutrition tracking application designed to help users monitor their daily health activities, manage calorie intake, track fitness goals, and build healthier habits.

The application provides a personalized dashboard where users can manage their fitness information and monitor their progress through an easy-to-use interface.

## Features

### 🔐 User Authentication
- User registration and login.
- Secure email and password authentication using Supabase.
- Individual user accounts.
- Persistent login sessions.
- Logout functionality.

### 👤 Personal Fitness Profile
- Full name and email.
- Age, gender and height.
- Current body weight.
- Activity level.
- Personalized fitness goals.

### 🥗 Nutrition Tracking
- Daily calorie tracking.
- Macronutrient tracking (Protein, Carbohydrates and Fat).
- Meal logging and management.
- Daily nutrition overview.

### 💪 Fitness Tracking
- Daily step tracking.
- Water intake monitoring.
- Sleep tracking.
- BMI screening indicator.
- Personalized fitness dashboard.

### 🔒 Data Privacy
- Supabase database integration.
- Row Level Security (RLS).
- Individual user data separation.
- Protected database access.

## Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| CSS | Styling and responsive design |
| Supabase | Authentication and database |
| PostgreSQL | Database management |
| Git & GitHub | Version control |

## Project Structure

```text
CalorIQ/
│
├── public/
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   └── supabase.js
│
├── supabase-schema.sql
├── index.html
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CalorIQ.git
```

### 2. Navigate to the Project Directory

```bash
cd CalorIQ
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Supabase

Create a Supabase project at:

https://supabase.com/

Open the SQL Editor and execute the SQL commands from `supabase-schema.sql` to create the required database tables and security policies.

### 5. Configure Environment Variables

Create a `.env` file in the project root.

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Replace the placeholders with your actual Supabase project credentials.

**Security Note:** Never expose your Supabase secret or service role key in frontend code or GitHub.

### 6. Configure Authentication

In your Supabase dashboard:

- Enable Email authentication.
- Configure the Site URL.
- Add your local development URL to the allowed redirect URLs.

For local development:

```text
http://localhost:5173
```

### 7. Run the Application

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## Database Security

CalorIQ uses Supabase Row Level Security (RLS) to restrict access to user-specific records.

Authenticated users should only be able to access and modify records associated with their own account, according to the configured database policies.

## Future Enhancements

- Integration with wearable fitness devices.
- AI-powered nutrition recommendations.
- Weekly and monthly fitness reports.
- Food database integration.
- Advanced fitness analytics.
- Progress charts and personalized recommendations.

## Author

**Amirthavarshiny V**

Information Technology

## License

This project is developed for educational and personal portfolio purposes.