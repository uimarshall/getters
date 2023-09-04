const Login = () => {
  return (
    // Add login page here
    <>
      {/* Add form with tailwind css */}
      <div className="flex justify-center items-center h-screen">
        <div className="w-full max-w-md">
          <form className="bg-white shadow-lg rounded px-12 pt-6 pb-8 mb-4">
            <div className="text-gray-800 text-2xl flex justify-center border-b-2 py-2 mb-4">Login</div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-normal mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="username"
                type="text"
                placeholder="Username"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-normal mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3"
                id="password"
                type="password"
                placeholder="Password"
              />
              <p className="text-red-500 text-xs italic">Please choose a password.</p>
            </div>
            <div className="flex items-center justify-between">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="button">
                Sign In
              </button>
              <a className="inline-block align-baseline font-normal text-sm text-blue-500 hover:text-blue-800" href="#">
                Forgot Password?
              </a>
            </div>
          </form>
          <p className="text-center text-gray-500 text-xs">&copy;2021 Gethub. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Login;
