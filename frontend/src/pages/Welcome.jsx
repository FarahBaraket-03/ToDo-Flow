import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle, Zap, BarChart3 } from 'lucide-react';

const logo = import.meta.env.VITE_img_URL10;
const illustration1 = import.meta.env.VITE_img_URL3;
const illustration2 = import.meta.env.VITE_img_URL4;
const illustration3 = import.meta.env.VITE_img_URL5;

const Welcome = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    setAnimateContent(true);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleGetStarted = () => {
    navigate('/today');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 dark:bg-primary-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-8 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Todo Flow" className="w-10 h-10 animate-bounce" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Todo Flow</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 sm:px-8 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div className={`space-y-8 transition-all duration-1000 ${animateContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-4">
                    Bienvenue, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">{user?.name || 'utilisateur'}</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                    Vous êtes prêt à transformer votre productivité ? Todo Flow vous aide à gérer vos tâches, suivre vos progrès et atteindre vos objectifs.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {[
                    {
                      icon: CheckCircle,
                      title: 'Gérez vos tâches',
                      description: 'Créez, organisez et suivez facilement vos tâches'
                    },
                    {
                      icon: Zap,
                      title: 'Productivité optimale',
                      description: 'Raccourcis clavier, drag-and-drop et bien plus'
                    },
                    {
                      icon: BarChart3,
                      title: 'Analysez vos progrès',
                      description: 'Visualisez vos statistiques et améliorez-vous'
                    }
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 transition-all duration-1000 ${animateContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                      style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                    >
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                          <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleGetStarted}
                  className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    animateContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: '600ms' }}
                  aria-label="Commencer maintenant"
                >
                  <span>Commencer maintenant</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Keyboard Shortcut Hint */}
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  💡 Une fois dans l'app, appuyez sur <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-semibold">Shift + ?</kbd> pour voir les raccourcis
                </p>
              </div>

              {/* Right: Images */}
              <div className={`relative h-96 sm:h-[500px] transition-all duration-1000 ${animateContent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                {/* Main illustration */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={illustration1}
                    alt="Todo illustration"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Floating cards */}
                <div
                  className="absolute -bottom-4 -left-4 w-32 h-32 rounded-lg shadow-lg overflow-hidden animate-bounce border-4 border-white dark:border-gray-800"
                  style={{ animationDelay: '0.2s' }}
                >
                  <img
                    src={illustration2}
                    alt="Feature 1"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div
                  className="absolute -top-4 -right-4 w-32 h-32 rounded-lg shadow-lg overflow-hidden animate-bounce border-4 border-white dark:border-gray-800"
                  style={{ animationDelay: '0.4s' }}
                >
                  <img
                    src={illustration3}
                    alt="Feature 2"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 sm:px-8 py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 Todo Flow. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Conditions</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
