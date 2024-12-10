const fs = require('fs');
const path = require('path');

function getStructure(dir, output = []) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            output.push(`\n📂 ${filePath}`);
            getStructure(filePath, output);
        } else {
            output.push(`\n📄 ${filePath}`);
            output.push(fs.readFileSync(filePath, 'utf-8'));
        }
    });

    return output;
}

const projectPath = './'; // Passe den Projektpfad an
const outputFile = 'projektstruktur_mit_code.txt';

const structure = getStructure(projectPath).join('\n');
fs.writeFileSync(outputFile, structure);

console.log(`Projektstruktur wurde in ${outputFile} exportiert.`);
