const supabase = require('../services/supabase.service');

const getQuestionById = async (req, res) => {
	try {
		const { id } = req.params;
		const { data, error } = await supabase.from('questions').select('*').eq('id', id).single();

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
		const { data, error } = await supabase.from('questions').select('*').order('id', { ascending: true });

		if (error) {
			return res.status(500).json({ error: 'Error obteniendo preguntas' });
		}

		res.json(data);
	} catch (error) {
		console.error('Error getting questions:', error);
		res.status(500).json({ error: 'Error interno del servidor' });
	}
};

const getQuestionsByCategory = async (req, res) => {
	try {
		const { categoryId } = req.params;
		console.log('Fetching questions for category:', categoryId);

		let { data, error } = await supabase.from('questions').select('*').eq('category__id', categoryId);

		console.log('Supabase response data:', data);
		console.log('Supabase response count:', data?.length);
		console.log('Supabase error:', error);

		if (error && error.message.includes('does not exist')) {
			console.log('category__id column does not exist, fetching all questions');
			const { data: allQuestions, error: allError } = await supabase.from('questions').select('*');

			if (allError) {
				console.error('Error fetching all questions:', allError);
				return res.status(500).json({ error: 'Error obteniendo preguntas', details: allError.message });
			}

			console.log(`Found ${allQuestions?.length || 0} total questions`);
			console.log('Sample question:', allQuestions?.[0]);

			data = allQuestions || [];
		}

		if (error && !error.message.includes('does not exist')) {
			console.error('Supabase error details:', error);
			return res.status(500).json({ error: 'Error obteniendo preguntas por categoría', details: error.message });
		}

		res.json(data || []);
	} catch (error) {
		console.error('Error getting questions by category:', error);
		res.status(500).json({ error: 'Error interno del servidor', details: error.message });
	}
};

module.exports = {
	getQuestionById,
	getAllQuestions,
	getQuestionsByCategory,
};
