import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { SparklesIcon } from './icons/SparklesIcon';
import { UsersIcon, ChatBubbleIcon, ArrowRightIcon } from './icons/ArrowRightIcon';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      <section className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <SparklesIcon className="w-4 h-4" />
                AI-Powered Simulations
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
                Practice Conversations with
                <span className="text-primary-600 dark:text-primary-400 block">Historical Icons</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-lg">
                Engage in realistic conversations with philosophers, leaders, scientists, and visionaries. 
                Improve your communication skills through immersive role-play scenarios.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <ReactRouterDOM.Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Get Started
                  <ArrowRightIcon className="w-5 h-5" />
                </ReactRouterDOM.Link>
                <ReactRouterDOM.Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white font-semibold rounded-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Learn More
                </ReactRouterDOM.Link>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl transform rotate-6 opacity-20"></div>
              <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-neutral-700/50 rounded-xl">
                    <img
                      src="https://picsum.photos/seed/socrates_philosopher/60/60"
                      alt="Socrates"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-medium">Socrates</p>
                      <p className="text-neutral-400 text-sm">Classical Greek Philosophy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-primary-600/20 rounded-xl border border-primary-500/30">
                    <img
                      src="https://picsum.photos/seed/nikolatesla/60/60"
                      alt="Nikola Tesla"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-medium">Nikola Tesla</p>
                      <p className="text-neutral-400 text-sm">Science</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-neutral-700/50 rounded-xl">
                    <img
                      src="https://picsum.photos/seed/malcolmx_activist/60/60"
                      alt="Malcolm X"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-medium">Malcolm X</p>
                      <p className="text-neutral-400 text-sm">Activist</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Choose a Persona</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Browse through dozens of historical figures, philosophers, and visionaries
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ChatBubbleIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Start Conversation</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Engage in realistic role-play scenarios powered by advanced AI
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Improve Skills</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Practice negotiation, communication, and critical thinking
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Ready to Start?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Join thousands of learners practicing their communication skills with AI-powered simulations.
          </p>
          <ReactRouterDOM.Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Get Started Free
            <ArrowRightIcon className="w-5 h-5" />
          </ReactRouterDOM.Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
