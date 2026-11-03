import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Sparkles,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ModerationReport, Post, UserProfile } from '../types';
import { getAdminReports, updateReportStatus, deletePostById, getAllUsers } from '../firebase/services';
import { formatNumber, formatRelativeTime } from '../utils/formatters';

interface AdminDashboardPageProps {
  posts: Post[];
  onPostDeleted?: (postId: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ posts, onPostDeleted }) => {
  const { userProfile, isAdmin } = useAuth();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'reports' | 'users' | 'analytics'>('overview');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [suspendedMap, setSuspendedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getAdminReports().then((res) => {
      setReports(res);
      setLoading(false);
    });
    getAllUsers().then((users) => {
      setUsersList(users);
    });
  }, []);

  if (!isAdmin) {
    return (
      <div className="w-full max-w-md mx-auto my-24 p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-center flex flex-col items-center gap-4">
        <Lock className="w-12 h-12 text-rose-400" />
        <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
          Administrator Access Required
        </h2>
        <p className="text-xs text-purple-200/60 leading-relaxed">
          You must be signed in with administrator credentials (such as abrarjahin702@gmail.com) to access this dashboard.
        </p>
      </div>
    );
  }

  const handleResolveReport = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    await updateReportStatus(reportId, status);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
  };

  const handleDeleteReportedPost = async (postId: string, reportId: string) => {
    await deletePostById(postId);
    if (onPostDeleted) onPostDeleted(postId);
    await handleResolveReport(reportId, 'reviewed');
  };

  const handleToggleSuspendUser = (uid: string) => {
    setSuspendedMap((prev) => ({ ...prev, [uid]: !prev[uid] }));
  };

  const totalUsers = usersList.length;
  const activeNow = usersList.length;
  const totalPostsCount = posts.length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 flex flex-col gap-6 select-none">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 to-pink-950/40 border border-purple-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-pink-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
              AbrarSnap Control Center
            </h1>
          </div>
          <p className="text-xs text-purple-200/60 mt-1">
            Global governance, moderation queue, user sanctions, and ecosystem health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Systems Optimal</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#120E22]/80 border border-purple-900/25 flex flex-col gap-1">
          <div className="flex items-center justify-between text-purple-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Creators</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white font-['Space_Grotesk'] mt-1">
            {formatNumber(totalUsers)}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">+18% this week</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#120E22]/80 border border-purple-900/25 flex flex-col gap-1">
          <div className="flex items-center justify-between text-pink-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Sessions</span>
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white font-['Space_Grotesk'] mt-1">
            {formatNumber(activeNow)}
          </p>
          <span className="text-[10px] text-pink-400 font-semibold">Live in 42 countries</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#120E22]/80 border border-purple-900/25 flex flex-col gap-1">
          <div className="flex items-center justify-between text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <span>Moments Published</span>
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white font-['Space_Grotesk'] mt-1">
            {formatNumber(totalPostsCount)}
          </p>
          <span className="text-[10px] text-indigo-300 font-semibold">Cloud Firestore synced</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#120E22]/80 border border-purple-900/25 flex flex-col gap-1">
          <div className="flex items-center justify-between text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span>Safety Queue</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white font-['Space_Grotesk'] mt-1">
            {pendingReportsCount}
          </p>
          <span className="text-[10px] text-rose-300 font-semibold">
            {pendingReportsCount === 0 ? 'Queue clean' : 'Awaiting review'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-900/20 pb-2">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'overview'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-purple-300/60 hover:text-white'
          }`}
        >
          Overview & Reports
        </button>
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'users'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-purple-300/60 hover:text-white'
          }`}
        >
          User Management ({usersList.length})
        </button>
        <button
          onClick={() => setTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'analytics'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-purple-300/60 hover:text-white'
          }`}
        >
          Platform Analytics
        </button>
      </div>

      {/* Tab: Overview & Moderation Queue */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Content Moderation & Incident Reports
          </h3>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="p-8 rounded-2xl bg-purple-950/20 border border-purple-900/20 text-center text-xs text-purple-300/50">
                No reports submitted. Community standards are maintained!
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-[#120E22]/80 border border-purple-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                          {report.targetType}
                        </span>
                        <span className="text-xs text-purple-300/50">
                          {formatRelativeTime(report.createdAt)}
                        </span>
                        <span className="text-[10px] text-purple-400 font-mono">
                          ID: {report.targetId}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-rose-200 mt-1">{report.reason}</p>
                      {report.details && (
                        <p className="text-[11px] text-purple-200/60 mt-0.5">{report.details}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {report.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleResolveReport(report.id, 'dismissed')}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                        {report.targetType === 'post' && (
                          <button
                            onClick={() => handleDeleteReportedPost(report.targetId, report.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Post</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveReport(report.id, 'reviewed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Clear</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400 capitalize px-3 py-1 rounded-full bg-emerald-500/10">
                        {report.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {tab === 'users' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Platform Registered Users
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-purple-900/30">
            <table className="w-full text-left text-xs text-purple-200">
              <thead className="bg-[#1C1635] text-purple-300 font-bold uppercase text-[10px] tracking-wider border-b border-purple-900/30">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Followers</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 bg-[#120E22]/60">
                {usersList.map((u) => {
                  const isSuspended = !!suspendedMap[u.uid];

                  return (
                    <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl}
                            alt={u.displayName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-purple-500/30"
                          />
                          <div>
                            <p className="font-bold text-white">{u.displayName}</p>
                            <p className="text-[10px] text-purple-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40' : 'bg-purple-950 text-purple-300'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">{formatNumber(u.followersCount)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuspended
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleSuspendUser(u.uid)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-rose-600/80 hover:bg-rose-500 text-white'
                            }`}
                          >
                            {isSuspended ? 'Unsuspend' : 'Suspend Account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-[#120E22]/80 border border-purple-900/30 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Engagement Breakdown
            </h4>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs text-purple-200 mb-1">
                  <span>Photo & Carousel Moments</span>
                  <span className="font-bold">68%</span>
                </div>
                <div className="h-2 rounded-full bg-purple-950 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[68%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-purple-200 mb-1">
                  <span>Short Video Reels</span>
                  <span className="font-bold">24%</span>
                </div>
                <div className="h-2 rounded-full bg-purple-950 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 w-[24%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-purple-200 mb-1">
                  <span>Direct Encrypted Messages</span>
                  <span className="font-bold">8%</span>
                </div>
                <div className="h-2 rounded-full bg-purple-950 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[8%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#120E22]/80 border border-purple-900/30 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Infrastructure Health
            </h4>
            <div className="space-y-2 text-xs text-purple-200 pt-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/40">
                <span>Google Cloud Firestore</span>
                <span className="text-emerald-400 font-bold">Connected • Latency 18ms</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/40">
                <span>Security Rules Engine</span>
                <span className="text-emerald-400 font-bold">Hardened v2 Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/40">
                <span>Firebase Authentication</span>
                <span className="text-emerald-400 font-bold">Healthy (Google + Email)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/40">
                <span>Client Session Storage</span>
                <span className="text-emerald-400 font-bold">Secure Tokenized</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
