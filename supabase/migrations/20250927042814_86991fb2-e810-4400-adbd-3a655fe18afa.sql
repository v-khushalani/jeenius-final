-- Enable RLS on profiles table (already enabled)
-- Create RLS policies for profiles table to ensure users can only access their own data

-- Policy for SELECT: Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy for INSERT: Users can only create their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Policy for UPDATE: Users can only update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Policy for DELETE: Users can only delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON profiles 
FOR DELETE 
TO authenticated 
USING (auth.uid() = id);

-- Enable RLS on questions table (already enabled)
-- Create policies for questions table - make questions publicly readable for authenticated users
-- This allows students to access questions for learning

-- Policy for SELECT: Authenticated users can view all questions
CREATE POLICY "Authenticated users can view questions" 
ON questions 
FOR SELECT 
TO authenticated 
USING (true);