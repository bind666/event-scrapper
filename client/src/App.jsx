import { useState, useEffect } from 'react';

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Set initial theme on load
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetch('http://localhost:4000/api/events')
      .then(res => res.json())
      .then(data => {
        console.log("Fetched events:", data); // 🔍 LOG HERE

        setEvents(data);
        setLoading(false);
      });
  }, []);

  async function handleGetTickets(event) {
    if (!email || !optIn) {
      setError('Please enter your email and accept opt-in.');
      return;
    }
    setError('');
    const res = await fetch('http://localhost:4000/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, eventUrl: event.url }),
    });
    if (res.ok) {
      window.open(event.url, '_blank');
      setSelectedEvent(null);
      setEmail('');
      setOptIn(false);
    } else {
      setError('Error submitting email.');
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">🎉 Sydney Events</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 dark:bg-gray-800 text-sm px-3 py-1 rounded shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={e.image}
                  alt={e.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-1">{e.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{e.datetime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{e.location}</p>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 mb-4">{e.price}</p>
                  <button
                    onClick={() => setSelectedEvent(e)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                  >
                    GET TICKETS
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg relative text-gray-800 dark:text-gray-100">
            <h2 className="text-2xl font-semibold mb-2">Get Tickets for:</h2>
            <p className="text-lg font-bold mb-4">{selectedEvent.title}</p>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <label className="flex items-center space-x-2 mb-3 text-sm">
              <input
                type="checkbox"
                checked={optIn}
                onChange={e => setOptIn(e.target.checked)}
                className="accent-indigo-600"
              />
              <span>I agree to receive emails about this event</span>
            </label>

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleGetTickets(selectedEvent)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Submit & Continue
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
