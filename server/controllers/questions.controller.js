const supabase = require("../services/supabase.service");


const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Error obteniendo preguntas' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getQuestionById,
  getAllQuestions
};
