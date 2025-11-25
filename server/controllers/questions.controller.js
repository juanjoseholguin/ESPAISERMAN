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

		const candidateColumns = [
			'category__id', // columna legacy (doble guion bajo)
			'category_id', // columna original
			'category', // texto (por si guardaron el nombre literal)
		];

		// Si el parámetro es numérico, intentamos primero las columnas numéricas
		const isNumeric = /^\d+$/.test(categoryId);
		const orderedColumns = isNumeric
			? ['category__id', 'category_id', 'category']
			: ['category', 'category__id', 'category_id'];

		let questions = [];
		let lastError = null;

		for (const column of orderedColumns) {
			if (!candidateColumns.includes(column)) continue;

			const { data, error } = await supabase
				.from('questions')
				.select('*')
				.eq(column, isNumeric && column !== 'category' ? Number(categoryId) : categoryId)
				.order('id', { ascending: true });

			if (error) {
				// Si la columna no existe, seguimos con la siguiente
				if (error.message?.includes('column') && error.message?.includes('does not exist')) {
					console.warn(`Column ${column} does not exist in questions table`);
					continue;
				}
				lastError = error;
				break;
			}

			if (Array.isArray(data) && data.length > 0) {
				console.log(`Found ${data.length} questions using column ${column}`);
				questions = data;
				break;
			}
		}

		if (lastError) {
			console.error('Supabase error details:', lastError);
			return res
				.status(500)
				.json({ error: 'Error obteniendo preguntas por categoría', details: lastError.message });
		}

		// Si no encontramos nada con los filtros, devolvemos todas para no bloquear al usuario
		if (questions.length === 0) {
			const { data: allQuestions, error: allError } = await supabase.from('questions').select('*').order('id');
			if (allError) {
				console.error('Error fetching all questions:', allError);
				return res.status(500).json({ error: 'Error obteniendo preguntas', details: allError.message });
			}
			console.warn(
				`No questions matched category ${categoryId}. Returning all (${allQuestions?.length || 0}) questions instead.`
			);
			questions = allQuestions || [];
		}

		res.json(questions);
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
