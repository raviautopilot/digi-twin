#!/bin/bash

# Ensure user-installed binaries are in PATH
export PATH="$HOME/.local/bin:$PATH"

# Configuration
PROJECT_DIR="${1:-.}"
GRAPHIFY_OUTPUT="graphify-out"
CACHE_DIR="$GRAPHIFY_OUTPUT/cache"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Check if graphify is installed
if ! command -v graphify &> /dev/null; then
    print_info "graphify could not be found, installing..."
    pip install graphify
    if [ $? -ne 0 ]; then
        print_error "Failed to install graphify."
        exit 1
    fi
fi

# ============================================
# CHECK FOR GO FILES FIRST
# ============================================
print_step "Checking for Go files..."
GO_FILES=$(find . -name "*.go" -type f 2>/dev/null | grep -v vendor | grep -v graphify-out | head -5)

if [ -z "$GO_FILES" ]; then
    print_warning "No Go files found in the current directory!"
    print_info "Graphify needs Go files to build a useful graph."
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
else
    print_info "Found Go files:"
    echo "$GO_FILES" | while read -r file; do
        echo "  - $file"
    done
    echo ""
fi

# ============================================
# BUILD/RECREATE THE GRAPH
# ============================================
print_step "Building knowledge graph..."

# ALWAYS rebuild with force to ensure fresh extraction
print_info "Running: graphify extract . --backend gemini --force --extractors go,doc,text"
graphify extract . --backend gemini --force --extractors go,doc,text

# Check if build was successful
if [ $? -eq 0 ] && [ -f "$GRAPHIFY_OUTPUT/graph.json" ]; then
    print_info "✅ Knowledge graph built successfully!"

    # Check if we actually have code nodes
    NODE_COUNT=$(jq '.nodes | length' "$GRAPHIFY_OUTPUT/graph.json" 2>/dev/null || echo "0")
    EDGE_COUNT=$(jq '.edges | length' "$GRAPHIFY_OUTPUT/graph.json" 2>/dev/null || echo "0")

    print_info "Graph stats: $NODE_COUNT nodes, $EDGE_COUNT edges"

    # Check if there are actual code nodes
    CODE_NODES=$(jq '.nodes[] | select(.type=="function" or .type=="method" or .type=="struct" or .type=="interface") | .name' "$GRAPHIFY_OUTPUT/graph.json" 2>/dev/null | wc -l)

    if [ "$CODE_NODES" -eq 0 ]; then
        print_warning "⚠️ No code nodes (functions, structs, etc.) found in the graph!"
        print_info "This means Graphify may not be extracting Go code properly."
        echo ""
        print_info "Possible fixes:"
        echo "  1. Make sure your Go files have actual code (not just package declarations)"
        echo "  2. Try running: graphify extract . --backend gemini --force --extractors go"
        echo "  3. Check if Graphify supports your Go version"
        echo "  4. Try with a simpler test file first"
        echo ""
        print_info "To see what WAS extracted:"
        echo "  cat graphify-out/GRAPH_REPORT.md"
        echo "  jq '.nodes[].name' graphify-out/graph.json | head -20"
    else
        print_info "✅ Found $CODE_NODES code nodes in the graph!"
    fi
else
    print_error "Failed to build knowledge graph"
    exit 1
fi

# ============================================
# ANTIGRAVITY INTEGRATION
# ============================================
print_step "Setting up Antigravity integration..."

graphify antigravity install

if [ $? -eq 0 ]; then
    print_info "✅ Antigravity integration installed"

    # Create symlink
    if [ -d ".agents" ]; then
        if [ -L ".agent" ]; then
            rm .agent
        elif [ -d ".agent" ]; then
            mv .agent .agent.backup
        fi
        ln -s .agents .agent
        print_info "✅ Symlink created: .agent -> .agents"
    fi
fi

# ============================================
# MCP CONFIG
# ============================================
print_step "Setting up MCP configuration..."

MCP_CONFIG_DIR="$HOME/.gemini/antigravity"
MCP_CONFIG_FILE="$MCP_CONFIG_DIR/mcp_config.json"
mkdir -p "$MCP_CONFIG_DIR"

# Backup existing config
if [ -f "$MCP_CONFIG_FILE" ]; then
    cp "$MCP_CONFIG_FILE" "$MCP_CONFIG_FILE.backup"
fi

cat > "$MCP_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "graphify": {
      "command": "uv",
      "args": ["run", "--with", "graphifyy", "--with", "mcp", "-m", "graphify.serve", "$(pwd)/graphify-out/graph.json"]
    }
  }
}
EOF
print_info "✅ MCP config updated"

# ============================================
# TEST THE GRAPH
# ============================================
print_step "Testing the graph..."

# Try a simple query
echo ""
print_info "Testing query: 'Show me all functions'"
graphify query "Show me all functions" 2>/dev/null || echo "  (No results found)"

echo ""
print_info "Testing query: 'What packages exist?'"
graphify query "What packages exist?" 2>/dev/null || echo "  (No results found)"

echo ""
print_info "You can also run:"
echo "  ./query-graphify.sh 'Show me all functions'"

# ============================================
# CREATE/UPDATE QUERY SCRIPT
# ============================================
cat > "query-graphify.sh" << 'EOF'
#!/bin/bash
# query-graphify.sh - Quick graph queries with debug info

GRAPH_FILE="graphify-out/graph.json"

if [ ! -f "$GRAPH_FILE" ]; then
    echo "❌ No graph found. Run setup first!"
    exit 1
fi

if [ $# -eq 0 ] || [ "$1" = "--stats" ] || [ "$1" = "-s" ]; then
    if command -v numfmt &> /dev/null; then
        GRAPH_SIZE=$(wc -c < "$GRAPH_FILE" | numfmt --to=si)
    else
        GRAPH_SIZE=$(wc -c < "$GRAPH_FILE")
    fi

    NODES=$(jq '.nodes | length' "$GRAPH_FILE" 2>/dev/null || echo "?")
    EDGES=$(jq '.edges | length' "$GRAPH_FILE" 2>/dev/null || echo "?")

    echo "📊 Graph: $GRAPH_SIZE, $NODES nodes, $EDGES edges"
    echo "💡 Queries cost ~200-500 tokens vs thousands with full files"
    echo "📈 Estimated savings: 95-99% per query"
    echo ""
    echo "Usage: ./query-graphify.sh 'your question'"
    echo "       ./query-graphify.sh --stats (-s) for this info"
    echo ""
    echo "Examples:"
    echo "  ./query-graphify.sh 'Show all functions'"
    echo "  ./query-graphify.sh 'What packages exist?'"
    echo "  ./query-graphify.sh 'Show all API endpoints'"
    exit 0
fi

# Try the query
echo "🔍 Querying: $1"
echo ""
graphify query "$1"

# If no results, show helpful info
if [ $? -ne 0 ] || [ -z "$(graphify query "$1" 2>/dev/null)" ]; then
    echo ""
    echo "💡 No results found. Try:"
    echo "  - 'Show all functions'"
    echo "  - 'What packages exist?'"
    echo "  - 'Show me the structure'"
    echo ""
    echo "📋 To see what's in the graph:"
    echo "  jq '.nodes[].name' graphify-out/graph.json | head -20"
fi
EOF

chmod +x query-graphify.sh
print_info "✅ Updated query-graphify.sh"

# ============================================
# VERIFY GRAPH CONTENT
# ============================================
print_step "Verifying graph content..."

echo ""
print_info "📋 What's in your graph:"
echo "---"

# Show sample nodes
if command -v jq &> /dev/null; then
    echo "Sample nodes (first 10):"
    jq '.nodes[0:10] | .[] | "  - \(.name) (\(.type // "unknown"))"' "$GRAPHIFY_OUTPUT/graph.json" 2>/dev/null || echo "  (No nodes found)"
    echo "---"

    # Count by type
    echo "Node types:"
    jq '.nodes | group_by(.type) | map({type: .[0].type, count: length}) | .[] | "  - \(.count) \(.type)"' "$GRAPHIFY_OUTPUT/graph.json" 2>/dev/null || echo "  (No types found)"
else
    print_warning "jq not installed - install for better insights: sudo apt install jq"
    echo "First few nodes:"
    grep -o '"name":"[^"]*"' "$GRAPHIFY_OUTPUT/graph.json" | head -5
fi

echo ""

# ============================================
# WATCH MODE
# ============================================
echo ""
read -p "Start watch mode for automatic updates? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting watch mode..."
    graphify extract . --backend gemini --watch &
    WATCH_PID=$!
    print_info "Watch mode running (PID: $WATCH_PID)"
    print_info "To stop: kill $WATCH_PID"
fi

# ============================================
# FINAL SUMMARY
# ============================================
print_info "✨ Setup complete!"
echo ""
print_info "📋 Next steps:"
echo "  1. RESTART Antigravity completely"
echo "  2. Type '/' in chat - look for '/graphify'"
echo "  3. Try: /graphify Show me all functions"
echo ""
print_info "🔧 Terminal commands:"
echo "  ./query-graphify.sh 'Show me all functions'"
echo "  ./query-graphify.sh --stats"
echo "  jq '.nodes[].name' graphify-out/graph.json | head -20"
echo ""
print_info "📊 If no code nodes found:"
echo "  - Make sure your Go files have functions, structs, etc."
echo "  - Try: graphify extract . --backend gemini --force --extractors go"
echo "  - Check: cat graphify-out/GRAPH_REPORT.md"