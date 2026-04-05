"use client";

// front‑end uses external backend – set this via NEXT_PUBLIC_API_URL


import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TopicSelector from "../../components/TopicSelector";
import PostEditor from "../../components/PostEditor";
import PostTypeSelector from "../../components/PostTypeSelector";
import ImageUploader from "../../components/ImageUploader";
import JobDetailsForm from "../../components/JobDetailsForm";
import LinkedInPreview from "../../components/LinkedInPreview";
import { useRouter } from "next/navigation";
import { useSession } from "../SessionWrapper";
import { motion } from "framer-motion";
import { NEXT_PUBLIC_API_URL } from "../../lib/config";
import { authenticatedFetch } from "../../utils/api";
const GUEST_DRAFT_KEY = "techpost_guest_draft";
const API_BASE = NEXT_PUBLIC_API_URL;

const DEFAULT_TEMPLATE = `Share your thoughts and expertise here. Start with a hook, add value, and end with a question or call to action.

#ProfessionalGrowth #TechPost`;

// Fixed templates for guests (no API) — same tone options as AI for consistency
const FIXED_TEMPLATES = {
  professional: [
    "Excited to share that our team just launched a new feature that increases productivity by 40%! 💼 The key was focusing on user feedback and iterative development. Tip: Always listen to your users - they often have the best insights on how to improve your product. What productivity hacks have worked for your team? Share in the comments below! #ProductDevelopment #Productivity",
    "Just wrapped up an insightful leadership workshop with my team. 📊 Two takeaways: 1) Regular check-ins improve team cohesion more than lengthy monthly meetings, and 2) Celebrating small wins boosts morale significantly. How do you foster leadership in your organization? I'd love to hear your thoughts! #LeadershipDevelopment #TeamGrowth",
    "Reflecting on my career journey, I've realized that the most valuable skill has been adaptability. 🔄 In today's rapidly changing landscape, being able to pivot and learn new skills quickly is essential. Tip: Set aside 2 hours weekly for learning something outside your comfort zone. What skill has been most valuable in your career? #ProfessionalDevelopment #CareerGrowth",
  ],
  casual: [
    "Had a total lightbulb moment during today's brainstorming session! 💡 Sometimes the best ideas come when you're just throwing things at the wall to see what sticks. Quick tip: Try standing meetings for brainstorming - we found they keep energy high and ideas flowing! Anyone else have cool brainstorming hacks? Drop them below! #WorkLife #Creativity",
    "Coffee chat with a mentor turned into a three-hour strategy session today! ☕ Amazing how a simple conversation can spark so many ideas. Tip: Don't underestimate the power of informal chats for problem-solving. Who's been your most influential mentor? #Mentorship #CareerChat",
    "Working from home today with my furry \"assistant\" who insists on keyboard walks during Zoom calls! 🐱 Remote work has its challenges but also its joys. Quick tip: Schedule short breaks to step outside - it's done wonders for my creativity. What's your favorite WFH perk? #RemoteWork #WorkLifeBalance",
  ],
  motivational: [
    "Don't let setbacks define your journey. Last quarter, our project faced major obstacles, but we persevered and found innovative solutions. 🚀 Remember: Challenges are opportunities in disguise. Tip: When facing obstacles, list 3 potential opportunities they might create. What challenge have you transformed into success? #Resilience #GrowthMindset",
    "Your comfort zone is a beautiful place, but nothing grows there. 🌱 This year, I committed to one presentation per month despite my fear of public speaking. Six months in, and the growth has been incredible! Tip: Start with small, consistent steps toward your fear. What comfort zone are you planning to step out of? #PersonalGrowth #Courage",
    "Success isn't about avoiding failure—it's about failing forward. 🔄 Every \"no\" brings you closer to a \"yes.\" Every setback teaches a lesson. Tip: Keep a \"lessons learned\" journal to track your growth through challenges. What's the most valuable lesson failure has taught you? #FailForward #SuccessMindset",
  ],
};

function getRandomTemplate(tone) {
  const list = FIXED_TEMPLATES[tone] || FIXED_TEMPLATES.professional;
  return list[Math.floor(Math.random() * list.length)];
}

function getGuestDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_DRAFT_KEY);
    if (raw) return raw;
  } catch (_) {}
  return null;
}

function saveGuestDraft(text) {
  if (typeof window === "undefined") return;
  try {
    if (text != null && text !== "") {
      localStorage.setItem(GUEST_DRAFT_KEY, text);
    } else {
      localStorage.removeItem(GUEST_DRAFT_KEY);
    }
  } catch (_) {}
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status, signOut } = useSession();
  const isAuthenticated = status === "authenticated";

  // Check if user has a valid user ID (not a fallback and not undefined)
  const hasValidUserId = session?.user?.id && session.user.id !== 'undefined' && session.user.id !== 'null' && session.user.id.trim() !== '';

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // State management
  const [postType, setPostType] = useState("regular");
  const [topics, setTopics] = useState([]);
  const [tone, setTone] = useState("professional");
  const [generated, setGenerated] = useState("");
  const [editing, setEditing] = useState("");
  const [useImage, setUseImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageSource, setImageSource] = useState("unsplash");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [jobDetails, setJobDetails] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    description: "",
  });

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, when: "beforeChildren", staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.28 } },
  };

  /** AI generate — logged-in only, calls API */
  const generate = useCallback(async () => {
    if (!isAuthenticated || !hasValidUserId) {
      setGenerated("Please log in to use this feature.");
      return;
    }
    try {
      setLoading(true);
      setGenerated("");
      setEditing("");
      // Only clear image if it's from Unsplash, keep custom uploaded images
      if (imageSource !== 'cloudinary') {
        setImageUrl("");
      }
      const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const headers = { "Content-Type": "application/json" };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      // Ensure userId is sent as a string
      const userId = String(session?.user?.id);

      // Validate userId before sending
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('Invalid userId for generate:', userId);
        setGenerated("Error: Invalid user session. Please log in again.");
        // Force logout to clear corrupted session
        signOut();
        return;
      }

      const res = await authenticatedFetch('/api/posts/generate', {
        method: "POST",
        headers,
        body: JSON.stringify({
          topics,
          tone,
          useImage,
          userId: userId,
          postType,
          jobDetails: postType === "job" ? jobDetails : null,
          imageUrl: imageUrl || undefined,
          imageSource,
        }),
      }, signOut);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.text) {
        setGenerated(data.text);
        setEditing(data.text);
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
        if (data.imageSource) {
          setImageSource(data.imageSource);
        }
      } else {
        const errorText = data.error || "Failed to generate post";
        setGenerated(errorText);
        setEditing(errorText);
      }
    } catch (err) {
      console.error("Error generating:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, topics, tone, useImage, session?.user?.id, postType, jobDetails, imageUrl, imageSource]);

  const loadInitialEditing = useCallback(() => {
    if (isAuthenticated) return;
    const saved = getGuestDraft();
    if (saved != null) setEditing(saved);
    else setEditing(DEFAULT_TEMPLATE);
  }, [isAuthenticated]);

  // Redirect to login if not authenticated or has invalid user ID
  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !hasValidUserId)) {
      router.replace('/login');
    }
  }, [status, hasValidUserId, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      loadInitialEditing();
    }
  }, [status, loadInitialEditing]);

  useEffect(() => {
    if (!isAuthenticated && editing !== "" && editing !== DEFAULT_TEMPLATE) {
      saveGuestDraft(editing);
    }
  }, [isAuthenticated, editing]);

  // Render different content based on state, but always call all hooks first
  let content;

  if (status === 'loading' || !hasValidUserId) {
    content = (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  } else {
    content = (
      <motion.div
        className="mx-auto max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          variants={itemVariants}
        >
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Tech Post Generator
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">
              {isAuthenticated
                ? `Welcome back, ${session?.user?.name || 'User'}!`
                : 'Try our AI-powered post generator'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Sign up
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              {isAuthenticated ? 'Sign out' : 'Try as guest'}
            </button>
          </div>
        </motion.header>

        <motion.div
          className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={itemVariants}
        >
          <motion.div variants={itemVariants}>
            <PostTypeSelector postType={postType} setPostType={setPostType} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <TopicSelector topics={topics} setTopics={setTopics} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-medium text-slate-900">Tone</h3>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="motivational">Motivational</option>
              </select>
            </div>
          </motion.div>
        </motion.div>

        {postType === "job" && (
          <motion.div className="mb-8" variants={itemVariants}>
            <JobDetailsForm jobDetails={jobDetails} setJobDetails={setJobDetails} />
          </motion.div>
        )}

        <motion.div
          className="mb-8 grid gap-6 lg:grid-cols-2"
          variants={itemVariants}
        >
          <motion.div variants={itemVariants}>
            <PostEditor
              editing={editing}
              setEditing={setEditing}
              generate={generate}
              loading={loading}
              isAuthenticated={isAuthenticated}
              hasValidUserId={hasValidUserId}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ImageUploader
              useImage={useImage}
              setUseImage={setUseImage}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              imageSource={imageSource}
              setImageSource={setImageSource}
              isAuthenticated={isAuthenticated}
            />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <LinkedInPreview
            postType={postType}
            topics={topics}
            tone={tone}
            generated={generated}
            editing={editing}
            useImage={useImage}
            imageUrl={imageUrl}
            jobDetails={jobDetails}
            isAuthenticated={isAuthenticated}
            hasValidUserId={hasValidUserId}
            saving={saving}
            saveMessage={saveMessage}
            onSave={savePost}
          />
        </motion.div>
      </motion.div>
    );
  }

  /** Save post for logged-in user (API -> DB) */
  async function savePost() {
    if (!isAuthenticated || !hasValidUserId) {
      setSaveMessage("Please log in to save posts.");
      return;
    }
    try {
      setSaving(true);
      setSaveMessage("");
      const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const headers = { "Content-Type": "application/json" };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      // Ensure userId is sent as a string
      const userId = String(session.user.id);

      console.log('Session user object:', session.user);
      console.log('Raw session.user.id:', session.user.id, 'type:', typeof session.user.id);
      console.log('Saving post with userId:', userId, 'type:', typeof userId);

      // Validate userId before sending
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('Invalid userId:', userId);
        setSaveMessage("Invalid user session. Please log in again.");
        // Force logout to clear corrupted session
        signOut();
        return;
      }

      const res = await authenticatedFetch('/api/posts', {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: userId,
          content: editing,
          topics,
          tone,
          imageUrl: imageUrl || undefined,
          postType,
          imageSource,
          jobDetails: postType === "job" ? jobDetails : null,
        }),
      }, signOut);
      const data = await res.json();
      if (data.ok) {
        setSaveMessage("Saved.");
        setTimeout(() => setSaveMessage(""), 2000);
      } else {
        console.error('Save failed with error:', data.error);
        setSaveMessage(data.error || "Save failed.");
      }
    } catch (err) {
      console.error("Save post error:", err);
      setSaveMessage("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  /** Fixed template for guests — no API, uses local templates by tone */
  function generateGuestTemplate() {
    const text = getRandomTemplate(tone);
    setEditing(text);
    setGenerated(text);
    setImageUrl("");
    saveGuestDraft(text);
  }

  // The render content is now handled in the conditional rendering above
  // This ensures all hooks are called before any conditional returns
  return (
    <motion.div
      className="mx-auto max-w-6xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Tech Post Generator
          </h1>
          <p className="mt-1 text-slate-600">
            Create professional posts and job postings for your network
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden truncate text-sm text-slate-600 sm:inline">
                Welcome {session?.user?.name}
              </span>
            </>
          ) : (
            <Link
              href="/login?mode=register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Signup to generate with AI
            </Link>
          )}
        </div>
      </motion.header>

      {/* Post Type Selector */}
      {isAuthenticated && (
        <motion.section variants={itemVariants} className="mb-6">
          <PostTypeSelector value={postType} onChange={setPostType} />
        </motion.section>
      )}

      {/* Topic Selector - only for regular posts */}
      {postType === "regular" && (
        <motion.section variants={itemVariants} className="mb-6">
          <TopicSelector value={topics} onChange={setTopics} />
        </motion.section>
      )}

      <motion.section
        className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-6 sm:p-6"
        variants={itemVariants}
      >
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor="tone-select" className="text-sm font-medium text-slate-700">
              Tone:
            </label>
            <select
              id="tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:px-4"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="motivational">Motivational</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={useImage}
              onChange={(e) => setUseImage(e.target.checked)}
              disabled={!isAuthenticated}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
            />
            Use AI image
          </label>
        </div>
        {isAuthenticated && postType === "regular" ? (
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Generate Post
              </>
            )}
          </button>
        ) : !isAuthenticated ? (
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={generateGuestTemplate}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Generate
            </button>
            <span className="text-sm text-slate-500">
              Fixed template · <Link href="/login" className="text-indigo-600 hover:underline">Log in</Link> for AI
            </span>
          </div>
        ) : null}
      </motion.section>

      {/* Image Uploader - hidden if "Include image" is checked, for both regular and job posts */}
      {isAuthenticated && !useImage && (
        <motion.section variants={itemVariants} className="mt-6">
          <ImageUploader
            onImageUpload={(url, source) => {
              setImageUrl(url);
              setImageSource(source);
            }}
            onImageRemove={() => {
              setImageUrl("");
              setImageSource("unsplash");
            }}
            currentImageUrl={imageUrl}
          />
        </motion.section>
      )}

      {/* Job Details Form - only show for job posts */}
      {isAuthenticated && (
        <motion.section variants={itemVariants} className="mt-6">
          <JobDetailsForm
            jobDetails={jobDetails}
            onChange={setJobDetails}
            visible={postType === "job"}
          />
          
          {/* Create Job Post Button - shown at bottom for job posts */}
          {postType === "job" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex justify-end"
            >
              <button
                type="button"
                onClick={generate}
                disabled={loading || !jobDetails.title || !jobDetails.company || !jobDetails.location || !jobDetails.jobType}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Create Job Post
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.section>
      )}

      <motion.section
        className="mt-6 grid gap-6 md:grid-cols-2"
        variants={itemVariants}
      >
        <div className="min-w-0">
          <PostEditor
            value={editing}
            onChange={setEditing}
            onSave={isAuthenticated ? savePost : undefined}
            saving={saving}
            saveMessage={saveMessage}
          />
        </div>
        <div className="min-w-0">
          <LinkedInPreview 
            content={editing} 
            imageUrl={imageUrl}
            postType={postType}
            jobDetails={postType === "job" ? jobDetails : null}
          />
        </div>
      </motion.section>
    </motion.div>
  );
}
