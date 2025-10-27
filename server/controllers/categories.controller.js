const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getCategories = async (req, res) => {
  try {
    console.log('Fetching categories from Supabase...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');
    
    const { data, error } = await supabase
      .from('question_category')
      .select('*')
      .order('id', { ascending: true });

    console.log('Supabase response data:', data);
    console.log('Supabase error:', error);

    if (error) {
      console.error('Supabase error details:', error);
      return res.status(500).json({ error: 'Error getting categories', details: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const getQuestionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('id', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Error getting questions' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting questions by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCategories,
  getQuestionsByCategory
};
