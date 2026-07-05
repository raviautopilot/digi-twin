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
