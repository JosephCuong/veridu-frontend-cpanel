const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cljglzhuwdniynfkzkxc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDAwMDAsImV4cCI6MjA1NTU1NTU1NX0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'veridu.net@gmail.com');
    
  if (error) {
    console.error('Error fetching profile:', error);
  } else {
    console.log('PROFILE DATA:', data);
  }
}
run();
