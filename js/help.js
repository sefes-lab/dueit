var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

DueIt.buildStudentHelp = function buildStudentHelp() {
  return '<h3>👋 Welcome to DueIt!</h3>' +
    '<p>DueIt helps you keep track of all your homework, tests, readings, and projects in one place. Here\'s how to get started:</p>' +

    '<h3>📝 Adding Assignments</h3>' +
    '<ul>' +
      '<li>Pick your <b>Class</b> and <b>Due Date</b></li>' +
      '<li>Choose the <b>Type</b> (Homework, Test, Reading, or Project)</li>' +
      '<li>Type in the <b>Assignment</b> name and hit <b>Add Assignment</b></li>' +
    '</ul>' +

    '<h3>✅ Tracking Your Progress</h3>' +
    '<ul>' +
      '<li><b>👍 Done</b> — Mark it when you finish the work</li>' +
      '<li><b>🫴 Turn In</b> — Mark it after you hand it in (shows up after Done)</li>' +
      '<li><b>📖 Studied</b> — For tests and quizzes, mark when you\'ve studied</li>' +
      '<li><b>📊 Grade</b> — After turning in or studying, record your grade (0–100)</li>' +
      '<li><b>✏️ Edit</b> — Fix a mistake or change the due date</li>' +
      '<li><b>🗑 Delete</b> — Remove an assignment you don\'t need</li>' +
    '</ul>' +

    '<h3>⭐ Earning XP & Leveling Up</h3>' +
    '<p>You earn XP for everything you do!</p>' +
    '<ul>' +
      '<li>Complete an assignment: <b>+10 XP</b></li>' +
      '<li>Turn it in: <b>+20 XP</b></li>' +
      '<li>Turn it in on time: <b>+10 bonus XP</b></li>' +
      '<li>Study for a test: <b>+15 XP</b></li>' +
      '<li>Record a grade: <b>+5 XP</b> (plus bonuses for B, A, and 100!)</li>' +
      '<li>Tests and projects earn <b>1.5x</b> grade XP</li>' +
    '</ul>' +
    '<p>Level up from Freshman all the way to Legend! 🎉</p>' +

    '<h3>🏆 Badges</h3>' +
    '<p>Unlock badges by hitting milestones — check them out in <b>Settings > Achievements</b>. Many badges have 4 tiers: ★ Bronze, ★★ Silver, ★★★ Gold, ★★★★ Diamond. Keep going to level them up!</p>' +

    '<h3>📅 Calendar View</h3>' +
    '<p>Tap the 📅 button in the tracker to see your assignments on a monthly calendar. Colored dots show what\'s due each day.</p>' +

    '<h3>⬆️ Sharing Progress</h3>' +
    '<p>Tap ⬆️ to share a progress report with your parent or teacher. You can email it, copy it, or use your phone\'s share menu.</p>' +
    '<div class="help-tip">💡 Check the "📎 Attach data" box to include your data file so your parent can see everything in their own DueIt!</div>' +

    '<h3>🎓 School Year</h3>' +
    '<p>In <b>Settings > School Year</b>:</p>' +
    '<ul>' +
      '<li><b>New Semester</b> — Pick a date to archive old assignments. Your XP carries over!</li>' +
      '<li><b>Year in Review</b> — See all your stats, grades, and badges across the whole year</li>' +
    '</ul>' +

    '<h3>🎨 Make It Yours</h3>' +
    '<p>In <b>Settings</b> (⚙️) you can:</p>' +
    '<ul>' +
      '<li>Pick a color theme and font</li>' +
      '<li>Set your name and grade</li>' +
      '<li>Add or rename your classes</li>' +
      '<li>Export or import your data</li>' +
      '<li>🔄 Sync assignments to your calendar app</li>' +
    '</ul>' +

    '<h3>🌙 Dark Mode</h3>' +
    '<p>Tap the moon/sun icon to switch between light and dark mode.</p>';
};

DueIt.buildParentHelp = function buildParentHelp() {
  return '<h3>👋 Welcome to Parent Mode</h3>' +
    '<p>Parent Mode gives you a clean overview of your child\'s assignments without the gamification elements. Here\'s how to use it:</p>' +

    '<h3>📊 Progress Summary</h3>' +
    '<p>At the top of the tracker you\'ll see three numbers:</p>' +
    '<ul>' +
      '<li><b>Total</b> — All assignments in the system</li>' +
      '<li><b>Completed</b> — Assignments marked done or studied</li>' +
      '<li><b>Overdue</b> — Past due and not yet completed</li>' +
    '</ul>' +

    '<h3>⬇️ Importing Your Child\'s Data</h3>' +
    '<p>Tap <b>⬇️</b> in the header to import a JSON data file from your child. This lets you see all their assignments and progress.</p>' +
    '<div class="help-tip">💡 Your child can send you their data by tapping ⬆️ Share with the "📎 Attach data" box checked.</div>' +

    '<h3>✏️ Reviewing & Updating</h3>' +
    '<p>You have full access to add, edit, and delete assignments — just like your child does. Use this to:</p>' +
    '<ul>' +
      '<li>Add assignments your child forgot to enter</li>' +
      '<li>Fix incorrect due dates</li>' +
      '<li>Mark items as done if needed</li>' +
      '<li>Record or update grades</li>' +
      '<li>Remove duplicates or old entries</li>' +
    '</ul>' +

    '<h3>⬆️ Sending Updates Back</h3>' +
    '<p>After making changes, tap <b>⬆️ Share</b> with "📎 Attach data" checked to send the updated data back. Your child imports it and the app will <b>smart merge</b> — keeping the newer version of each assignment.</p>' +
    '<div class="help-tip">💡 Smart merge means neither side loses work. If your child completed something while you were editing, their newer update wins for that assignment.</div>' +

    '<h3>🖨️ Printing Reports</h3>' +
    '<p>Tap 🖨️ to print a full assignment report with status, due dates, grades, and completion dates.</p>' +

    '<h3>🎓 School Year</h3>' +
    '<p>In <b>Settings > School Year</b>:</p>' +
    '<ul>' +
      '<li><b>New Semester</b> — Archive old assignments by date. XP carries over for your child.</li>' +
      '<li><b>Year in Review</b> — See consolidated stats, grades, and progress across the year</li>' +
    '</ul>' +

    '<h3>⚙️ Settings</h3>' +
    '<p>In Settings you can:</p>' +
    '<ul>' +
      '<li>Change colors and fonts</li>' +
      '<li>Manage classes</li>' +
      '<li>Export data, import data, or sync to calendar</li>' +
    '</ul>' +

    '<h3>🔄 Switching Back</h3>' +
    '<p>Tap the <b>[Parent]</b> pill in the header to switch back to Student mode. The mode is remembered between visits.</p>';
};
