import pandas as pd
import json
import os
from rdkit import Chem
from rdkit.Chem import Draw
from rdkit.Chem import rdDepictor
from rdkit.Chem import Descriptors
from rdkit.Chem import Lipinski
import zipfile

# Configuration
INPUT_FILE = 'compounds_AnaB.xlsx'
OUTPUT_DIR = 'assets/images'
SDF_DIR = 'assets/sdf'
DATA_FILE = 'data.json'

def process_data():
    # Create output directories
    for directory in [OUTPUT_DIR, SDF_DIR]:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Created directory: {directory}")

    # Load Excel file
    try:
        df = pd.read_excel(INPUT_FILE)
        print(f"Loaded {len(df)} compounds from {INPUT_FILE}")
    except Exception as e:
        print(f"Error loading Excel file: {e}")
        return

    compounds_data = []

    for index, row in df.iterrows():
        try:
            # Extract data
            compound_id = str(row.get('Number', index))
            smiles = row.get('SMILES', '')
            name = row.get('Name', f'Compound {compound_id}')
            compound_class = row.get('Class', 'Unclassified')
            molecular_formula = row.get('Molecular', 'N/A')
            referencias = str(row.get('Referencias', 'N/A'))

            if not isinstance(smiles, str) or not smiles:
                print(f"Skipping row {index}: Invalid SMILES")
                continue

            # Generate Molecule from SMILES
            mol = Chem.MolFromSmiles(smiles)
            if mol:
                rdDepictor.Compute2DCoords(mol)
                
                # Calculate Properties
                mw = Descriptors.ExactMolWt(mol)
                logp = Descriptors.MolLogP(mol)
                tpsa = Descriptors.TPSA(mol)
                
                # Lipinski Properties
                hbd = Lipinski.NumHDonors(mol)
                hba = Lipinski.NumHAcceptors(mol)
                ro5_violations = sum([
                    1 for val, limit in [(mw, 500), (logp, 5), (hbd, 5), (hba, 10)] if val > limit
                ])
                lipinski_pass = ro5_violations <= 1
                
                # specific image name
                image_filename = f"mol_{compound_id}.svg"
                image_path = os.path.join(OUTPUT_DIR, image_filename)
                
                # Generate SVG
                Draw.MolToFile(mol, image_path, size=(300, 300), imageType='svg')

                # Generate SDF
                sdf_filename = f"mol_{compound_id}.sdf"
                sdf_path = os.path.join(SDF_DIR, sdf_filename)
                w = Chem.SDWriter(sdf_path)
                mol.SetProp("_Name", name) # Set internal molecule name
                w.write(mol)
                w.close()
                
                # Add to data list
                compounds_data.append({
                    "id": compound_id,
                    "name": name,
                    "class": compound_class,
                    "molecular_formula": molecular_formula,
                    "referencias": referencias,
                    "smiles": smiles,
                    "image": image_filename,
                    "sdf": sdf_filename,
                    "mw": round(mw, 2),
                    "logp": round(logp, 2),
                    "tpsa": round(tpsa, 2),
                    "hbd": hbd,
                    "hba": hba,
                    "lipinski_pass": lipinski_pass,
                    "ro5_violations": ro5_violations
                })
            else:
                print(f"Failed to generate molecule for row {index} (SMILES: {smiles})")

        except Exception as e:
            print(f"Error processing row {index}: {e}")

    # Generate Bulk ZIP for docking
    zip_path = os.path.join('assets', 'all_structures.zip')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(SDF_DIR):
            for file in files:
                if file.endswith('.sdf'):
                    file_path = os.path.join(root, file)
                    zipf.write(file_path, arcname=os.path.join('sdf', file))

    # Save to JS file
    js_content = f"const compoundsData = {json.dumps(compounds_data, indent=4)};"
    
    with open('data.js', 'w') as f:
        f.write(js_content)
    
    print(f"Successfully processed {len(compounds_data)} compounds.")
    print(f"Bulk SDF dataset packed into {zip_path}")
    print(f"Data saved to data.js")

if __name__ == "__main__":
    process_data()
