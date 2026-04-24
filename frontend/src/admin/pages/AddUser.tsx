import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AddUser() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto w-full pt-4">
      <div className="mb-8">
        <h1 className="text-h1 font-h1 text-on-background mb-2">Add New User</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant">
          Create a new account and assign role-based access to the platform.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-sm">
        <form 
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/users");
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-caps font-label-caps text-on-surface-variant" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                className="h-12 px-4 bg-surface-container-lowest border border-outline rounded text-on-surface font-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container"
                placeholder="e.g. Jane Doe"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-caps font-label-caps text-on-surface-variant" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="h-12 px-4 bg-surface-container-lowest border border-outline rounded text-on-surface font-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container"
                placeholder="jane.doe@example.com"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-label-caps font-label-caps text-on-surface-variant" htmlFor="role">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  className="h-12 px-4 w-full appearance-none bg-surface-container-lowest border border-outline rounded text-on-surface font-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container pr-10"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>Select a role...</option>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-label-caps font-label-caps text-on-surface-variant" htmlFor="password">
                Initial Password
              </label>
              <input
                type="password"
                id="password"
                className="h-12 px-4 bg-surface-container-lowest border border-outline rounded text-on-surface font-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <span className="text-sm font-body-sm text-on-surface-variant mt-1">
                Must be at least 8 characters long.
              </span>
            </div>
          </div>

          <hr className="border-outline-variant my-2" />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
            <Link
              to="/users"
              className="h-12 px-6 rounded bg-surface-container-lowest border border-outline text-on-surface font-button hover:bg-surface-container transition-colors flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="h-12 px-6 rounded bg-primary text-on-primary font-button hover:opacity-90 transition-colors flex items-center justify-center"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
