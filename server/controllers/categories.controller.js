const supabase = require("../services/supabase.service");

const getAllCategories = async (req, res) => {
  try {
    console.log("📂 Obteniendo categorías desde Supabase...");
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error("❌ Error obteniendo categorías:", error);
      return res.status(500).json({ error: 'Error obteniendo categorías de Supabase' });
    }

    if (!data || data.length === 0) {
      console.log("⚠️ No hay categorías en la base de datos");
      return res.json([]);
    }

    console.log("✅ Categorías obtenidas:", data.length);
    console.log("📊 Categorías:", data.map(c => `${c.id}: ${c.name}`).join(', '));
    res.json(data);
  } catch (error) {
    console.error('❌ Error in getAllCategories:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📂 Obteniendo categoría por ID:", id);
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("❌ Error obteniendo categoría:", error);
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    console.log("✅ Categoría encontrada:", data.name);
    res.json(data);
  } catch (error) {
    console.error('❌ Error in getCategoryById:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getQuestionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log("❓ Obteniendo preguntas para categoría:", categoryId);
    
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('id', { ascending: true });

    if (error) {
      console.error("❌ Error obteniendo preguntas:", error);
      return res.status(500).json({ error: 'Error obteniendo preguntas' });
    }

    console.log("✅ Preguntas obtenidas:", data.length);
    if (data.length > 0) {
      console.log("📊 Ejemplos de preguntas:", data.slice(0, 2).map(q => `"${q.question}"`).join(', '));
    }
    res.json(data);
  } catch (error) {
    console.error('❌ Error in getQuestionsByCategory:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCategoriesWithQuestionCount = async (req, res) => {
  try {
    console.log("📂 Obteniendo categorías con conteo de preguntas...");
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });

    if (categoriesError) {
      console.error("❌ Error obteniendo categorías:", categoriesError);
      return res.status(500).json({ error: 'Error obteniendo categorías' });
    }

    if (!categories || categories.length === 0) {
      return res.json([]);
    }

    // Obtener conteo de preguntas para cada categoría
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('id')
          .eq('category_id', category.id);

        if (questionsError) {
          console.error(`❌ Error obteniendo preguntas para categoría ${category.id}:`, questionsError);
          return { ...category, question_count: 0 };
        }

        return { ...category, question_count: questions?.length || 0 };
      })
    );

    console.log("✅ Categorías con conteo obtenidas:", categoriesWithCount.length);
    categoriesWithCount.forEach(cat => {
      console.log(`   ${cat.id}: ${cat.name} (${cat.question_count} preguntas)`);
    });

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('❌ Error in getCategoriesWithQuestionCount:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getQuestionsByCategory,
  getCategoriesWithQuestionCount
};
