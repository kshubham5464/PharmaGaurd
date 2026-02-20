
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkInteractions() {
    const { data, error } = await supabase
        .from('drug_gene_interactions')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        // Print full fields
        if (data && data.length > 0) {
            console.log('COLUMNS:', Object.keys(data[0]).join(', '));
        }
        console.log('Interactions Sample:', JSON.stringify(data, null, 2));
    }
}

checkInteractions();
